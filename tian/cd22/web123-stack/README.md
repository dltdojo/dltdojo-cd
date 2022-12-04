# web123

# 🍪 101 busybox httpd

兩頁靜態網站。

```sh
docker compose -f docker-compose.101.yaml up
```

# 🐐 102 cgi-bin and sqlite

內嵌資料庫與動態網頁 cgi-bin。

- [SQLite Transaction Explained By Practical Examples](https://www.sqlitetutorial.net/sqlite-transaction/)

```sh
docker compose -f docker-compose.102.yaml up
```

# 🐑 103 curl

抓取外部服務內容。

- http://info.cern.ch - home of the first website

```sh
docker compose -f docker-compose.103.yaml up
```

# 🍧 104 repo site

抓取內部服務內容。

```sh
docker compose -f docker-compose.104.yaml up
```

# 🍧 105 sqlite service

sqlite 轉成 HTTP 微服務，實際上原始資料庫有自己的協定都不是走 HTTP，部份會支援類似 JDBC 通用協定。

```sh
docker compose -f docker-compose.105.yaml up
```

# 10x database

- [postgres - Official Image | Docker Hub](https://hub.docker.com/_/postgres)

# 10x php

todo

# 10x java/jsp

todo

# 10x html script element

- javascript
- playwright

# 10x server site javascript

- nodejs
- playwright
- k6


#  🍫 20x LAMP

- [LAMP (software bundle) - Wikipedia](https://en.wikipedia.org/wiki/LAMP_(software_bundle))
- [LAMP vs. MEAN: What’s the Difference? | IBM](https://www.ibm.com/cloud/blog/lamp-vs-mean)
- L: Linux (operating system)
- A: Apache (web server)
- M: MySQL (a relational database management system, or RDBMS, that uses SQL)
- P: PHP (programming/scripting language)
- [MEAN and MERN (JS-based Stacks) Vs LAMP Stack](https://codecondo.com/mean-and-mern-js-based-stacks-vs-lamp-stack/)


# 🍬 30x MEAN

- [MEAN (solution stack) - Wikipedia](https://en.wikipedia.org/wiki/MEAN_(solution_stack))
- M: MongoDB (non-RDBMS NoSQL database)
- E: Express.js (backend web framework)
- A: AngularJS (frontend framework that builds user interfaces)
- N: Node.js (open-source backend runtime environment)


#  🍭 40x MERN

- R: React (frontend framework)
- [MERN vs LAMP. Has the Time Come to Dump LAMP and… | by Ajay Kapoor | Enlear Academy](https://enlear.academy/mern-vs-lamp-f0653b0dc96a)

#  🍮 50x JAM

Javascript, APIs, and Markup

- [Jamstack: a Deep Dive | Xata Blog](https://xata.io/blog/jamstack-mern-lamp-stack-comparison)
- [Jamstack Community Survey Results 2022 | Jamstack](https://jamstack.org/survey/2022/)
- [What does CSR, SSR, SSG and ISR means and why should you care?](https://www.flavienbonvin.com/data-building-strategy-for-nextjs-app/)
