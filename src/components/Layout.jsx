import React from 'react';
import Header from './Header';
import Footer from './Footer';
import FloatingChatbot from './FloatingChatbot';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      <FloatingChatbot />
    </>
  );
}
