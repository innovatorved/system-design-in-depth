# Primary & Authoritative Source Bibliography

This repository derives its educational claims, algorithms, and technical formulations from primary academic papers, formal standards, textbooks, and engineering publications.

---

## 1. Seminal Distributed Systems & Storage Papers

- **Amazon Dynamo:**  
  DeCandia, G., Hastorun, D., Jampani, M., Kakulapati, G., Lakshman, A., Pilchin, A., Sivasubramanian, S., Vosshall, P., & Vogels, W. (2007). *Dynamo: Amazon's highly available key-value store*. ACM SIGOPS Operating Systems Review, 41(6), 205-220. [DOI: 10.1145/1323293.1294281](https://doi.org/10.1145/1323293.1294281)
- **Raft Consensus:**  
  Ongaro, D., & Ousterhout, J. (2014). *In search of an understandable consensus algorithm*. 2014 USENIX Annual Technical Conference (USENIX ATC 14), 305-319. [USENIX ATC '14](https://www.usenix.org/conference/atc14/technical-sessions/presentation/ongaro)
- **Google File System (GFS):**  
  Ghemawat, S., Gobioff, H., & Leung, S. T. (2003). *The Google file system*. ACM SIGOPS Operating Systems Review, 37(5), 29-43. [DOI: 10.1145/1165389.945450](https://doi.org/10.1145/1165389.945450)
- **Google Spanner:**  
  Corbett, J. C., et al. (2013). *Spanner: Google’s globally distributed database*. ACM Transactions on Computer Systems (TOCS), 31(3), 1-22.
- **Log-Structured Merge-Tree (LSM-Tree):**  
  O’Neil, P., Cheng, E., Gawlick, D., & O’Neil, E. (1996). *The log-structured merge-tree (LSM-tree)*. Acta Informatica, 33(4), 351-385.
- **Bitcask:**  
  Sheehy, J., & Smith, D. (2010). *Bitcask: A high performance key/value storage engine*. Basho Technologies Whitepaper.
- **SWIM Membership Protocol:**  
  Das, A., Gupta, I., & Motivala, A. (2002). *SWIM: Scalable weakly-consistent infection-style process group membership protocol*. International Conference on Dependable Systems and Networks, 303-312.
- **HyperLogLog:**  
  Flajolet, P., Fusy, É., Gandouet, O., & Meunier, F. (2007). *Hyperloglog: the analysis of a near-optimal cardinality estimation algorithm*. Discrete Mathematics and Theoretical Computer Science, AH, 127-146.
- **Count-Min Sketch:**  
  Cormode, G., & Muthukrishnan, S. (2005). *An improved data stream summary: the count-min sketch and its applications*. Journal of Algorithms, 55(1), 58-75.
- **t-digest Quantile Sketch:**  
  Dunning, T., & Ertl, O. (2019). *Computing extremely accurate quantiles using t-digests*. arXiv preprint arXiv:1902.04023.

---

## 2. Standards & RFC Specifications

- **HTTP/1.1 & HTTP/2:** IETF RFC 7230, RFC 7231, RFC 7540, RFC 9113.
- **WebSockets:** IETF RFC 6455 (*The WebSocket Protocol*).
- **Transport Layer Security (TLS 1.3):** IETF RFC 8446.
- **QUIC & HTTP/3:** IETF RFC 9000, RFC 9114.
- **Consistent Hashing:** Karger, D., et al. (1997). *Consistent hashing and random trees*. STOC '97.

---

## 3. Authoritative Textbooks

- Kleppmann, Martin. (2017). *Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems*. O'Reilly Media.
- Petrov, Alex. (2019). *Database Internals: A Deep Dive into How Distributed Data Systems Work*. O'Reilly Media.
- Beyer, B., Jones, C., Petoff, J., & Murphy, N. R. (2016). *Site Reliability Engineering: How Google Runs Production Systems*. O'Reilly Media.
- Kreps, Jay. (2014). *I Heart Logs: Event Data, Stream Processing, and Data Integration*. O'Reilly Media.

---

## 4. Industry Case Studies & Engineering Postmortems

- **Stripe:** Brandur Leach. *Designing robust and predictable APIs with idempotency*. (2017).
- **Discord:** Bo Ingram. *How Discord Stores Trillions of Messages*. (2023).
- **Instagram:** Mike Krieger. *Sharding & Architecture at Instagram*. (2011).
- **GitLab:** *Postmortem of database outage of January 31, 2017*.
- **Meta (Facebook):** Doug Beaver et al. *Finding a needle in Haystack: Facebook's photo storage*. (OSDI 2010).
