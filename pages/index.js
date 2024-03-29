import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Content from "./components/Content";
import Profile from "./components/Profile";
import Footer from "./components/utility/Footer";
import Intro from "./components/utility/Intro";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Smit Gabani</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="author" content="Smit Gabani" />
        <meta name="application-name" content="Smit Gabani Portfolio Website" />
        <meta name="generator" content="Smit Gabani" />
        <meta
          name="keywords"
          content="smit gabani, toronto, react, angular, ios, anroid, web developer, react, website designer, responsive web design"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css"
	  	integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous"/> */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
          integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g=="
          crossOrigin="anonymous"
          referrerpolicy="no-referrer"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {/* <Intro /> */}
        <Profile />
        <Content />
      </main>
    </div>
  );
}
