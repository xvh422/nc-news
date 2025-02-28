const {
  convertTimestampToDate,
  createLookupObject,
  swapKeys,
} = require("../db/seeds/utils");

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("createLookupObject", () => {
  test("returns an object", () => {
    expect(createLookupObject([])).toEqual({});
  });
  test("returns an object relating values of key1 to values of key2 for multiple objects", () => {
    const input = [
      {
        article_id: 1,
        article_title: "They're not exactly dogs, are they?",
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 16,
        author: "butter_bridge",
        created_at: 1586179020000,
      },
    ];
    const expected = { "They're not exactly dogs, are they?": 1 };

    const output = createLookupObject(input, "article_title", "article_id");

    expect(output).toEqual(expected);
  });
  test("returns an object relating values of key1 to values of key2 for multiple objects", () => {
    const input = [
      {
        article_id: 1,
        article_title: "They're not exactly dogs, are they?",
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 16,
        author: "butter_bridge",
        created_at: 1586179020000,
      },
      {
        article_id: 2,
        article_title: "Living in the shadow of a great man",
        body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        votes: 14,
        author: "butter_bridge",
        created_at: 1604113380000,
      },
      {
        article_id: 3,
        article_title: "Eight pug gifs that remind me of mitch",
        body: "git push origin master",
        votes: 0,
        author: "icellusedkars",
        created_at: 1592641440000,
      },
    ];
    const expected = {
      "They're not exactly dogs, are they?": 1,
      "Living in the shadow of a great man": 2,
      "Eight pug gifs that remind me of mitch": 3,
    };

    const output = createLookupObject(input, "article_title", "article_id");

    expect(output).toEqual(expected);
  });
  test("does not add repeat values to lookup object if they exist in the input array", () => {
    const input = [
      {
        article_id: 1,
        article_title: "They're not exactly dogs, are they?",
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 16,
        author: "butter_bridge",
        created_at: 1586179020000,
      },
      {
        article_id: 2,
        article_title: "Living in the shadow of a great man",
        body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        votes: 14,
        author: "butter_bridge",
        created_at: 1604113380000,
      },
      {
        article_id: 2,
        article_title: "Living in the shadow of a great man",
        body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
        votes: 100,
        author: "icellusedkars",
        created_at: 1583025180000,
      },
    ];
    const expected = {
      "They're not exactly dogs, are they?": 1,
      "Living in the shadow of a great man": 2,
    };

    const output = createLookupObject(input, "article_title", "article_id");

    expect(output).toEqual(expected);
  });
  test("does not mutate input array", () => {
    const input = [
      {
        article_id: 1,
        article_title: "They're not exactly dogs, are they?",
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 16,
        author: "butter_bridge",
        created_at: 1586179020000,
      },
      {
        article_id: 2,
        article_title: "Living in the shadow of a great man",
        body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        votes: 14,
        author: "butter_bridge",
        created_at: 1604113380000,
      },
      {
        article_id: 3,
        article_title: "Eight pug gifs that remind me of mitch",
        body: "git push origin master",
        votes: 0,
        author: "icellusedkars",
        created_at: 1592641440000,
      },
    ];
    const expected = [
      {
        article_id: 1,
        article_title: "They're not exactly dogs, are they?",
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 16,
        author: "butter_bridge",
        created_at: 1586179020000,
      },
      {
        article_id: 2,
        article_title: "Living in the shadow of a great man",
        body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        votes: 14,
        author: "butter_bridge",
        created_at: 1604113380000,
      },
      {
        article_id: 3,
        article_title: "Eight pug gifs that remind me of mitch",
        body: "git push origin master",
        votes: 0,
        author: "icellusedkars",
        created_at: 1592641440000,
      },
    ];

    createLookupObject(input, "park_name", "park_id");

    expect(input).toEqual(expected);
  });
});

describe("swapKeys", () => {
  test("returns an empty array when passed an empty array", () => {
    const inputArr = [];
    const inputObj = {};
    const expected = [];

    const output = swapKeys(inputArr, inputObj);

    expect(output).toEqual(expected);
  });
  test("returns an array containing an object with the artist swapped for the artist ID when pased an array containing 1 object", () => {
    const inputArr = [
      {
        article_title: "They're not exactly dogs, are they?",
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 16,
        author: "butter_bridge",
        created_at: 1586179020000,
      },
    ];
    const inputObj = { "They're not exactly dogs, are they?": 1 };
    const expected = [
      {
        article_id: 1,
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 16,
        author: "butter_bridge",
        created_at: 1586179020000,
      },
    ];

    const output = swapKeys(inputArr, inputObj, "article_title", "article_id");

    expect(output).toEqual(expected);
  });
  test("returns an array containing objects with the artist swapped for the artist ID when pased an array containing multiple objects", () => {
    const inputArr = [
      {
        article_title: "They're not exactly dogs, are they?",
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 16,
        author: "butter_bridge",
        created_at: 1586179020000,
      },
      {
        article_title: "Living in the shadow of a great man",
        body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        votes: 14,
        author: "butter_bridge",
        created_at: 1604113380000,
      },
      {
        article_title: "Living in the shadow of a great man",
        body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
        votes: 100,
        author: "icellusedkars",
        created_at: 1583025180000,
      },
      {
        article_title: "Eight pug gifs that remind me of mitch",
        body: "git push origin master",
        votes: 0,
        author: "icellusedkars",
        created_at: 1592641440000,
      },
    ];
    const inputObj = {
      "They're not exactly dogs, are they?": 1,
      "Living in the shadow of a great man": 2,
      "Eight pug gifs that remind me of mitch": 3,
    };
    const expected = [
      {
        article_id: 1,
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 16,
        author: "butter_bridge",
        created_at: 1586179020000,
      },
      {
        article_id: 2,
        body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        votes: 14,
        author: "butter_bridge",
        created_at: 1604113380000,
      },
      {
        article_id: 2,
        body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
        votes: 100,
        author: "icellusedkars",
        created_at: 1583025180000,
      },
      {
        article_id: 3,
        body: "git push origin master",
        votes: 0,
        author: "icellusedkars",
        created_at: 1592641440000,
      },
    ];

    const output = swapKeys(inputArr, inputObj, "article_title", "article_id");

    expect(output).toEqual(expected);
  });
  describe("purity tests", () => {
    test("returns a different array to the input array", () => {
      const inputArr = [];
      const inputObj = {};

      const output = swapKeys(inputArr, inputObj, "article_title", "article_id");

      expect(output).not.toBe(inputArr);
    });
    test("inputs are not mutated", () => {
      const inputArr = [
        {
          article_title: "They're not exactly dogs, are they?",
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 16,
          author: "butter_bridge",
          created_at: 1586179020000,
        },
        {
          article_title: "Living in the shadow of a great man",
          body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
          votes: 14,
          author: "butter_bridge",
          created_at: 1604113380000,
        },
        {
          article_title: "Living in the shadow of a great man",
          body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
          votes: 100,
          author: "icellusedkars",
          created_at: 1583025180000,
        },
        {
          article_title: "Eight pug gifs that remind me of mitch",
          body: "git push origin master",
          votes: 0,
          author: "icellusedkars",
          created_at: 1592641440000,
        },
      ];
      const inputObj = {
        "They're not exactly dogs, are they?": 1,
        "Living in the shadow of a great man": 2,
        "Eight pug gifs that remind me of mitch": 3,
      };
      const expectedArr = [
        {
          article_title: "They're not exactly dogs, are they?",
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 16,
          author: "butter_bridge",
          created_at: 1586179020000,
        },
        {
          article_title: "Living in the shadow of a great man",
          body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
          votes: 14,
          author: "butter_bridge",
          created_at: 1604113380000,
        },
        {
          article_title: "Living in the shadow of a great man",
          body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
          votes: 100,
          author: "icellusedkars",
          created_at: 1583025180000,
        },
        {
          article_title: "Eight pug gifs that remind me of mitch",
          body: "git push origin master",
          votes: 0,
          author: "icellusedkars",
          created_at: 1592641440000,
        },
      ];
      const expectedObj = {
        "They're not exactly dogs, are they?": 1,
        "Living in the shadow of a great man": 2,
        "Eight pug gifs that remind me of mitch": 3,
      };

      const output = swapKeys(inputArr, inputObj, "article_title", "article_id");

      expect(inputArr).toEqual(expectedArr);
      expect(inputObj).toEqual(expectedObj);
    });
  });
});
