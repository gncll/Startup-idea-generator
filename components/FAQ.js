import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      question: "How many ideas can I generate for free?",
      answer: "You can generate up to 10 startup ideas for free without signing up. After that, you'll need to create an account for unlimited access to our simple generator and advanced features."
    },
    {
      question: "What's the difference between Simple and Advanced Generator?",
      answer: "The Simple Generator asks 2 basic questions and provides a quick startup idea overview. The Advanced Generator (requires sign-up) asks detailed questions and provides comprehensive business plans, MVP features, market analysis, weekly roadmaps, and validation strategies."
    },
    {
      question: "Do I need to provide my own OpenAI API key?",
      answer: "No! We provide AI-powered idea generation out of the box. You don't need any technical setup or API keys. Just describe your problem and solution, and we'll handle the rest."
    },
    {
      question: "Can I export my generated startup ideas?",
      answer: "Yes! In the Advanced Generator, you can export your complete startup plan as an HTML file that can be converted to PDF. You can also share your ideas directly from the platform."
    },
    {
      question: "How accurate are the market size estimations?",
      answer: "Our AI provides realistic market size estimations based on current industry data and trends. However, these are estimates for guidance only. We recommend conducting your own market research for actual business planning."
    },
    {
      question: "Can I modify or regenerate specific sections?",
      answer: "Yes! In the Advanced Generator, you can regenerate individual sections like MVP features, validation strategies, or weekly plans without regenerating the entire idea."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely! We use Clerk for secure authentication and don't store your startup ideas permanently. Your data is processed securely and you have full control over your information."
    },
    {
      question: "What if I need help with my startup after generating an idea?",
      answer: "While we provide comprehensive startup plans, we recommend consulting with business advisors, mentors, or startup incubators for personalized guidance on executing your specific idea."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <HelpCircle className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
        </div>
        <p className="text-gray-600 text-lg">Everything you need to know about our Startup Idea Generator</p>
      </div>

      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-medium text-gray-900 pr-4">{item.question}</h3>
              {openItems[index] ? (
                <ChevronUp className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              )}
            </button>
            
            {openItems[index] && (
              <div className="px-6 pb-4">
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Still have questions?</h3>
          <p className="text-gray-600 mb-6">Can't find the answer you're looking for? Feel free to reach out to us.</p>
          <a 
            href="#contact"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ; 