import { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import axios from '../config/axios'
const CodeReview = () => {
  const [code, setCode] = useState(`function sum() {\n  return 1 + 1;\n}`);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, []);

  const reviewCode = async () => {
    setLoading(true);
    setReview('');
    try {
      //write here: 
      const res = await axios.post('/ai/review', { code });
 
    const reviewText = JSON.parse(res.data.response).text;
      
        setReview(reviewText);
     
    } catch (err) {
      setReview('⚠️ Something went wrong. Please check the backend or try again.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">💡 AI Code Reviewer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <div className="flex flex-col bg-gray-900 p-4 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-2">🧠 Paste Your Code</h2>
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={(code) => prism.highlight(code, prism.languages.javascript, 'javascript')}
            padding={16}
            className="rounded-md font-mono text-sm bg-gray-800 border border-gray-700 overflow-auto min-h-[300px]"
            style={{
              fontFamily: '"Fira Code", monospace',
              fontSize: 14,
              color: '#fff'
            }}
          />
          <button
            onClick={reviewCode}
            disabled={loading}
            className="mt-4 self-start px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition"
          >
            {loading ? 'Reviewing...' : '🔍 Review Code'}
          </button>
        </div>

        {/* AI Review Output */}
        <div className="bg-gray-900 p-4 rounded-xl shadow-lg overflow-auto">
          <h2 className="text-xl font-semibold mb-2">✅ AI Review</h2>
          <div className="prose prose-invert max-w-none text-sm">
            <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeReview;
