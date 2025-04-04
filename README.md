# NC News

**Hosted Version**

The hosted version of this project can be found [here](https://nc-news-5066.onrender.com/api)

**Summary**

This API contains all of the endpoints for my application "NC News" in which users can make posts on particular topics, comment on posts, and vote on whether they like or dislike others' posts and comments.
Below are some instructions on how to run this API on a local device.

**Instructions for Setup**

The following commands should be run in the terminal

1. Run: `git clone https://github.com/xvh422/nc-news.git`

2. In the newly created folder, run: `npm install`

3. Create two .env files in the main folder:
- .env.test
- .env.development

4. Insert the following line into each .env file:
- .env.test:
  `PGDATABASE=nc_news_test`
- .env.development:
  `PGDATABASE=nc_news`  

5. Run the following commands to create and seed databases:
- `npm run setup-dbs`
- `npm run seed`
- `npm run test-seed`

**Dependencies**

Node: v23.6.1
Postgres: v8.13.3
