import React, { useState, useEffect } from "react";
import Parser from "rss-parser"; // Import the rss-parser library

export default function Articles() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const parser = new Parser();

    // Replace this URL with the URL of your RSS feed
    const rssFeedURL = "https://medium.com/@smitgabani/feed";

    parser.parseURL(rssFeedURL, (err, feed) => {
      if (err) {
        console.error("Error parsing RSS feed:", err);
      } else {
        setArticles(feed.items);
      }
    });
  }, []);

  return (
    <div className="articles">
      {articles.map((article, index) => (
        <a className="article" href={article.link} key={index} target="_blank">
          <div>
            <h2>{article.title}</h2>
            <p>{article.contentSnippet}</p>
            <div className="bottom_section">
              {article.categories.map((category, catIndex) => (
                <a key={catIndex} href="#">
                  {category}
                </a>
              ))}
            </div>
          </div>
          <div className="date">{new Date(article.pubDate).toDateString()}</div>
        </a>
      ))}
    </div>
  );
}
