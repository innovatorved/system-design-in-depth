# POSIX Shell & Coreutils Reference

`@innovatorved/code-lab` includes a pure-JavaScript POSIX shell AST interpreter and 40+ UNIX coreutils running directly against the in-memory Virtual Filesystem (VFS).

It requires zero `eval()`, zero `new Function()`, and is 100% Content Security Policy (CSP) compliant.

---

## 1. Shell Syntax & Operators

### Pipelines (`|`)
Chain stdout of one command directly into stdin of the next:
```bash
cat balancer.js | grep -n "class" | head -n 5
find . -name "*.js" | wc -l
cat access.log | grep " 500 " | awk '{print $1}' | sort | uniq -c
```

### Redirection (`>`, `>>`, `<`, `2>&1`, `&>`)
Redirect command output to or from virtual files:
```bash
# Overwrite file
echo "hello world" > out.txt

# Append to file
echo "another line" >> out.txt

# Redirect stderr to stdout
node broken.js > log.txt 2>&1

# Redirect all streams
cmd &> combined.log

# Input redirection
wc -l < data.json
```

### Logical Chaining (`&&`, `||`, `;`)
```bash
# Execute sequentially regardless of exit code
mkdir src; touch src/index.ts; ls -la src

# Execute only if preceding command succeeded (exit code 0)
node demo.js > demo.log && cat demo.log

# Fallback on failure
grep -q "TODO" solution.js || echo "All TODOs completed!"
```

### Background Execution (`&`) & Process Table
Keep long-running servers or jobs listening in the background:
```bash
# Start an HTTP server in the background
node server.js &
# or
bun run server.ts &

# View active processes and port bindings
ps
ports

# Terminate process by PID
kill 1
```

### Environment Variables & Command Substitution
```bash
# Set and export variable
export PORT=8080
echo "Listening on $PORT"

# Default value syntax
echo "User: ${NAME:-anonymous}"

# Last exit code
echo $?

# Command substitution
echo "Current directory contains $(ls | wc -l) files"
```

### Glob Expansion
Wildcards match filenames directly against the virtual filesystem:
```bash
ls *.js
rm -f src/**/*.bak
head -n 2 test/*.js
```

---

## 2. Supported Coreutils Reference (40+ Commands)

| Command | Supported Flags | Description | Example |
| :--- | :--- | :--- | :--- |
| `ls` | `-l`, `-a`, `-la`, `-1`, `-h` | List directory contents | `ls -la /workspace` |
| `cd` | (path) | Change working directory | `cd src/` |
| `pwd` | none | Print current working directory | `pwd` |
| `cat` | `-n`, `-b` | Concatenate files to stdout | `cat balancer.js` |
| `head` | `-n <num>` | Output first N lines of file/stdin | `head -n 10 demo.js` |
| `tail` | `-n <num>` | Output last N lines of file/stdin | `tail -n 5 out.log` |
| `grep` | `-n`, `-i`, `-r`, `-v`, `-E` | Search patterns in text or files | `grep -rin "export" .` |
| `find` | `-name`, `-type [f/d]`, `-maxdepth` | Find files matching pattern | `find src/ -name "*.ts"` |
| `wc` | `-l` (lines), `-w` (words), `-c` (bytes) | Print newline, word, and byte counts | `wc -l README.md` |
| `sort` | `-r` (reverse), `-n` (numeric), `-u` (unique) | Sort lines of text files | `sort -n numbers.txt` |
| `uniq` | `-c` (count), `-i` (case-insensitive) | Report or omit repeated lines | `sort file \| uniq -c` |
| `sed` | `s/find/replace/g`, `d` | Stream editor for filtering and transforming text | `sed 's/foo/bar/g' in.txt` |
| `awk` | `-F <delim>`, `'{print $N}'` | Pattern scanning and processing | `awk -F: '{print $1}' /etc/passwd` |
| `cut` | `-d <delim>`, `-f <field>`, `-c <chars>` | Remove sections from lines | `cut -d, -f2 data.csv` |
| `tr` | `-d`, `set1 set2` | Translate or delete characters | `echo "abc" \| tr 'a-z' 'A-Z'` |
| `diff` | `-u` | Compare files line by line | `diff -u starter.js solution.js` |
| `tree` | `-L <depth>`, `-a` | List contents of directories in a tree format | `tree -L 2` |
| `cp` | `-r` (recursive), `-f` | Copy files and directories | `cp -r src/ src-backup/` |
| `mv` | `-f` | Move or rename files | `mv demo.js demo.old.js` |
| `rm` | `-r` (recursive), `-f` (force) | Remove files or directories | `rm -rf dist/` |
| `mkdir` | `-p` (parents) | Make directories | `mkdir -p src/lib/` |
| `touch` | none | Update timestamps or create empty files | `touch server.ts` |
| `stat` | none | Display file or file system status | `stat README.md` |
| `chmod` | none | Change file mode bits | `chmod +x script.sh` |
| `echo` | `-n`, `-e` | Display a line of text | `echo "hello"` |
| `printf` | format specifiers (`%s`, `%d`, etc.) | Format and print data | `printf "val=%d\n" 42` |
| `curl` | `-i`, `-v`, `-s`, `-X`, `-H`, `-d` | Transfer data from or to an HTTP server | `curl -i http://localhost:3000` |
| `node` | `<file>`, `-e`, `-p`, `--test` | Run Node.js scripts or start interactive REPL | `node demo.js` |
| `bun` | `run <file>`, `test`, `init`, `repl` | Run Bun scripts or test suites natively | `bun run server.ts &` |
| `npm` | `install <pkg>`, `test`, `run <script>` | Manage packages and run scripts | `npm install zod` |
| `git` | `status`, `diff`, `log`, `branch` | In-memory Git status and history | `git status` |
| `ps` | none | Report snapshot of current processes | `ps` |
| `ports`| none | List active listening TCP / HTTP ports | `ports` |
| `jobs` | none | List background jobs | `jobs` |
| `kill` | `<pid>` | Terminate process by PID | `kill 1` |
| `clear`| none | Clear the terminal screen | `clear` |
| `history`| none | Display previously executed commands | `history` |
| `date` | none | Display current time and date | `date` |
| `sleep`| `<seconds>` | Delay for a specified amount of time | `sleep 2` |
| `whoami`| none | Print current effective userid | `whoami` |
| `uname`| `-a` | Print system information | `uname -a` |
| `which`| `<command>` | Locate a command | `which node` |
| `env`  | none | Print environment variables | `env` |
| `export`| `KEY=val` | Set export attribute for shell variables | `export NODE_ENV=production` |
| `unset`| `KEY` | Unset values and attributes of variables | `unset NODE_ENV` |
| `help` | none | Display summary of built-in commands | `help` |
