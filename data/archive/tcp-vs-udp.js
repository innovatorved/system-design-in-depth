window.ARCHIVE_CONTENT = window.ARCHIVE_CONTENT || {};
window.ARCHIVE_CONTENT["tcp-vs-udp"] = `# TCP vs UDP

TCP and UDP are transport protocols: rules for moving data between applications over an IP network. They differ in how the receiving program gets that data and what happens when some of it goes missing.

TCP provides an ordered stream of bytes and retransmits missing data. UDP sends separate messages, called datagrams, without adding delivery or ordering guarantees.

![TCP can deliver writes cat and nap as reads ca and tnap. UDP retains separate cat and nap datagrams when both arrive.](/course-assets/system-design/research-pilot/style-comparison/tcp-editorial.webp)

| Behavior | TCP | UDP |
|---|---|---|
| Connection setup | Establishes a connection before the usual data transfer. | No transport handshake. |
| What the app reads | A byte stream; reads can split or combine messages. | Separate datagrams that arrive. |
| Missing data | Retransmits; later bytes wait behind a gap. | No automatic retransmission. |

IP, the Internet Protocol, routes packets: chunks of data with addressing information. Packets can be lost, duplicated or delivered out of order. The transport protocol determines how much of that the app has to handle.

## TCP message boundaries

TCP keeps bytes in order, but it doesn't preserve the boundaries between the sender's writes. This matters when your program needs to recognize a complete message.

For example, a server writes \`cat\` and then \`nap\`. TCP carries the six bytes \`catnap\`. The client could read them as \`cat\` and \`nap\`, as \`ca\` and \`tnap\`, or all at once.

The application protocol needs a rule for finding the end of each message. This is called **framing**. A simple text protocol could put a newline after each word.

The receiver collects bytes until it reaches that newline, then processes the completed word. Another protocol might put a message length before the message contents.

HTTP libraries handle their protocol's framing for you. If you work directly with TCP, a single read is not proof that the whole message has arrived.

UDP preserves the boundary of each datagram. Sending \`cat\` in one and \`nap\` in another gives the receiver two distinguishable messages if both arrive. Their arrival order can differ from their send order.

## TCP loss recovery

TCP numbers bytes and uses acknowledgements, or ACKs, to track what has arrived. An ACK identifies the next byte the receiver expects after the continuous sequence it has already received.

The sender keeps unacknowledged data. It can resend that data when acknowledgements or a timeout indicate possible loss.

Consider \`catnap\` again. Number the bytes from 1 to 6 for this example, and split them into packets carrying \`ca\`, \`tn\` and \`ap\`. The packet containing \`tn\` is lost.

| Event | Bytes available to the app so far | Next expected byte |
|---|---|---|
| \`ca\` arrives | \`ca\` | 3 |
| \`ap\` arrives, but \`tn\` is missing | \`ca\` | 3 |
| Retransmitted \`tn\` arrives | \`catnap\` | 7 |

The receiver holds \`ap\` until the gap is filled. This is **head-of-line blocking**: missing earlier bytes prevent later bytes from being delivered to the application.

The byte positions are illustrative; the connection is already open. ACK 7 means all six bytes have arrived. The receiving program can still read them in smaller chunks.

Retransmission doesn't promise a deadline. If the connection fails before recovery, the transfer remains incomplete.

An ACK also doesn't prove that the server program processed the data. The server's TCP implementation can acknowledge a request before the application reads it.

For a save operation, the client needs an application response confirming the save. If that response is lost, the client can still be unsure whether the save succeeded.

![A TCP acknowledgment confirms receipt of bytes. In this example the bytes are in the server buffer and the application has not saved them yet.](/course-assets/system-design/research-pilot/style-comparison/tcp-sketch.webp)

## Connection setup and traffic control

A usual new TCP connection starts with three messages: SYN, SYN-ACK and ACK. The two ends establish their starting sequence numbers and connection settings during this handshake.

The client normally waits one round trip before sending application data. Reusing an open connection avoids repeating this setup. Packet travel time and waiting in network queues still apply to either protocol.

TCP also limits how much data is in flight. **Flow control** respects the receiver's available buffer space. **Congestion control** adjusts sending to conditions on the network path.

They address different bottlenecks. A receiving machine can have plenty of memory while the network link leading to it is overloaded.

## When skipping a message is acceptable

A game might send a player's complete position in updates numbered 501, 502 and 503. If 502 is lost, the game can use 503 without waiting. If 502 arrives later, the game can discard it.

The update numbers and the rule for ignoring older positions belong to the game protocol. UDP doesn't supply them.

This only works if each update contains enough information on its own. If 503 describes movement since 502, losing 502 leaves the receiver without the position needed to apply that change.

A voice call has a similar timing constraint: a sound fragment arriving after its playback time may no longer be useful. A protocol over UDP can skip it and continue.

Other traffic in the same product may need reliable delivery. A chat message or purchase can't be treated like an outdated position update.

UDP applications also need traffic control. Retrying every lost message immediately can overload a link that is already dropping packets.

## HTTP/3 and QUIC

Using UDP doesn't necessarily mean giving up reliability. QUIC implements encrypted connections, congestion control and reliable byte streams over UDP. HTTP/3 uses QUIC.

QUIC orders bytes separately in each stream. With HTTP/2 over one TCP connection, a gap in the shared TCP stream can delay both an image and a stylesheet.

With HTTP/3, received stylesheet bytes can continue along their stream while missing image bytes are recovered. If a lost packet contains data for both streams, both can be affected. They also share congestion control.

For an ordinary web API, use HTTPS and let its transport implementation handle these details. The [[wiki/http-rest-grpc|HTTP lesson]] explains the protocol versions further.

Database clients also commonly use TCP. DNS uses both UDP and TCP, including retrying a truncated UDP answer over TCP. A familiar application name does not always imply one transport.

Building directly on UDP makes sense when you need control over which messages can be skipped or recovered. You also take responsibility for the delivery behavior and traffic control your application requires.
`;
