window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["database-ticket-servers"] = `# Database ticket servers

A database ticket server allocates unique IDs for other parts of an application. It returns a number; the application uses that number when it stores a record in its own database.

This is useful when data is spread across several databases and their records need unique numeric IDs across all of them. Each database's local auto-increment counter cannot provide that guarantee on its own.

We'll work through three parts:

- Why Flickr needed an ID allocator and how its MySQL table issued IDs.
- How reserving several IDs per database call works, with a small SQLite exercise.
- What happens to unused IDs after a crash, and how that affects range size.

![A shared allocator supplies ID 42 to one application and ID 43 to another. The applications store the photos separately.](/course-assets/system-design/research-pilot/style-comparison/ticket-editorial.webp)

## Why a separate ID allocator?

In Flickr's 2010 system, photos were spread across many databases. The company needed to move them between databases without primary-key collisions.

Two independent databases can both assign photo ID 42. Each ID is unique within its own table, but combining or moving those records creates a collision.

A ticket server moves ID generation into a shared service. The application asks for an ID before storing the photo. The allocator keeps track of IDs it has issued; it doesn't store the photo itself.

[[wiki/uuid-objectid-and-snowflake|UUIDs]] and [[wiki/snowflake-id-design|Snowflake IDs]] are alternatives. A ticket server is useful when you want numeric IDs allocated through a database you already know how to operate.

The IDs only need to be unique within the chosen scope. Photos can share one sequence and accounts another. Photo 42 and account 42 are different records, identified by both their type and their number.

## How Flickr's ticket table worked

In Flickr's implementation, asking for an ID meant updating a small MySQL table. It had an auto-incrementing ID and a unique marker column called \`stub\`. Each allocation supplied the same marker.

MySQL's \`REPLACE\` operation removed the row with that marker and inserted a replacement with a new ID. The table held one row while the counter advanced.

The application then called \`LAST_INSERT_ID()\` on the same database connection to retrieve that ID. Connection pools matter here: both statements must use the same connection because the value is connection-local.

To avoid relying on one ticket server, Flickr used two. One allocated odd IDs and the other even IDs. They couldn't issue the same ID, even if one server allocated more than the other.

A replacement server must preserve its counter position as well as its odd/even role. Restarting the odd sequence at 1 would reuse old IDs. Restoring an old backup can cause the same problem.

## Allocating several IDs at once

So far, every new record needs a network call to the allocator. Reserving several IDs in one call reduces that traffic: a worker can issue IDs locally until its range runs out.

Meituan's 2017 Leaf-segment design does this with a shared counter. The database records the highest reserved ID; each worker tracks the next unused ID in its own range.

With a range size of three, starting from zero:

| Reservation | IDs the worker receives | Highest reserved ID |
|---|---|---|
| Worker A | 1, 2, 3 | 3 |
| Worker B | 4, 5, 6 | 6 |
| Next reservation | 7, 8, 9 | 9 |

Reading the old boundary and advancing it must be one protected transaction. Otherwise, two workers could both read zero and claim 1 through 3.

The reservation must commit before the worker issues any of its IDs. This is where [[wiki/database-locking-and-isolation|locking and isolation]] apply to the allocator.

To try the reservation yourself, run this small SQLite example. It reserves two ranges of three IDs, just like the first two rows in the table.

It uses a counter row rather than MySQL's auto-increment mechanism. The database exists only in memory and is discarded when the command exits.

\`\`\`bash title="terminal"
sqlite3 -header :memory: <<'SQL'
CREATE TABLE tickets (name TEXT PRIMARY KEY, high INTEGER NOT NULL);
INSERT INTO tickets VALUES ('photos', 0);
BEGIN IMMEDIATE;
UPDATE tickets SET high = high + 3 WHERE name = 'photos'
  RETURNING high - 2 AS first_id, high AS last_id;
COMMIT;
BEGIN IMMEDIATE;
UPDATE tickets SET high = high + 3 WHERE name = 'photos'
  RETURNING high - 2 AS first_id, high AS last_id;
COMMIT;
SQL
\`\`\`
\`\`\`output
first_id|last_id
1|3
first_id|last_id
4|6
\`\`\`

This output was captured with SQLite 3.51.0 on 2026-09-15. The \`RETURNING\` clause requires SQLite 3.35 or newer.

\`BEGIN IMMEDIATE\` starts a write transaction. Another writer to the same database must wait or receive a busy error. This example uses one connection to show the reservation arithmetic.

The SQL client prints \`RETURNING\` values before \`COMMIT\`. A real allocator must wait until the commit succeeds before returning the range to its caller.

## Unused IDs after a crash

Reserving a range and using it happen separately. A worker can stop after the reservation commits, leaving some IDs unused.

**A reserves 1 through 3, uses 1 and crashes. B owns 4 through 6 and hasn't used any yet. Which ID should B use next? Can A's replacement reuse 2?**

B uses 4, the first ID in its range. A's replacement reserves a fresh range starting at 7. It discards 2 and 3 because it cannot safely assume that A never issued them before crashing.

Gaps are expected. The counter records reservations, so it can advance even when no corresponding photo is stored.

ID order also doesn't give creation order. A worker holding ID 1 can pause while another worker stores a photo with ID 4, even when both obtained their ranges from the same allocator.

![Photo 4 is saved first while the worker with ID 1 pauses. Photo 1 is saved later, so numeric ID order does not establish creation order.](/course-assets/system-design/research-pilot/style-comparison/ticket-sketch.webp)

A lost allocator reply has a similar result: the caller can request another range and abandon the uncertain one. It uses more numbers but avoids reissuing them.

This doesn't prevent duplicate uploads. Retrying the same photo upload may obtain a new ID and store a second photo. That requires separate [[wiki/retries-timeouts-idempotency|idempotency handling]].

## Choosing a range size

Larger ranges can leave more unused IDs when a worker stops. In return, workers call the database less often and can continue through an allocator outage until their ranges run out.

Leaf also fetches the next range before the current one is exhausted. This reduces the chance that a request has to wait for a refill.

If one database already generates all your IDs, a ticket service adds another dependency without solving a current collision problem. Consider it when independent writers need a shared numeric ID space.

Monitor allocation failures and remaining integer space. Sequential IDs also require normal authorization checks: guessing another record's number must not grant access to it.

For a larger exercise, the [Python allocation replay](/course-assets/system-design/m09-ticket-allocator.py) extends the SQLite example with two worker processes and a deliberately lost reply.
`;
