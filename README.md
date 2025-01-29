# Overview

This repository contains some experiments for indexing/search code for user content (e.g. text documents) to be used for applications where only the client software has access to user data (i.e. a server cannot see any plain-text user data).

## Motivation

The main motivation for this approach is a class of applications where privacy guarantees (enforced by the runtime) can be achieved by ensuring an application cannot use leak user data. For example, applications:

- Cannot make arbitrary network calls
- Applications can store data to the server, through an API that encrypts data before storage

The runtime can provide various capabilities that would traditionally require network calls. For example, the runtime environment could provide an API for collecting usage statistics which would aggregate data across many users. This bucketing of the information would ensure that individuals cannot be identified, while still allowing the developer to understand how the product is being used.

This approach would have several benefits:

- The user can have confidence that their data is secure, enforced by the platform they are running on
- The user can trust their personal data to applications from untrusted developers
- The user can enable capabilities that they would otherwise not feel comfortable doing

The last benefit listed could allow for very powerful capabilities in applications, without the user needing to worry about data privacy. For example, an application could have an AI-driven voice based interface that uses always-on microphone access to allow for seamless user interaction via voice in addition to any graphical interface.

## Challenges

In the context of searching/indexing, only the client can possess knowledge to perform a query, so it must have all the information necessary to do so. So a client could:

a. Always download all user content, index and query locally
b. Some sort of Homomorphic Encryption search
c. Compute and store an encrypted index, download the index to query

The goal of this repository is to explore some ideas around the latter option.

# Storing indexes

Some ideas around storing the indexes:

- Have multiple slices of the index which can be downloaded and used based on the query
  - May not need the whole index based on the query (may also not be a problem depending on the size of things)
- Have base versions of the index + deltas to reduce network transfers
  - i.e. Only upload (or download) a delta when there are changes
  - Recompute a new base version at some point, until then use base + deltas for operations
- Invalidate documents on change, do not recompute index immediately
  - Doing a search at that point would pull the index + any invalidated documents and perform the query against the combination of those two sources of data
- Compress indexes and any deltas using shared compression dictionaries
