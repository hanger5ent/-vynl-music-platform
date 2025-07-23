const fs = require('fs');
const path = require('path');

/**
 * Feedback Collection Script
 * Run this to collect and export testing feedback
 */

function collectFeedback() {
  console.log('🔍 Collecting Testing Feedback...\n');
  
  // This would typically read from your database
  // For now, it provides instructions for collecting browser localStorage data
  
  console.log('📋 Instructions for Feedback Collection:');
  console.log('=====================================');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Go to Application/Storage tab');
  console.log('3. Find localStorage');
  console.log('4. Look for "testingFeedback" key');
  console.log('5. Copy the JSON data');
  console.log('');
  console.log('Or ask testers to export their feedback using this command in browser console:');
  console.log('=====================================');
  console.log('localStorage.getItem("testingFeedback")');
  console.log('');
  
  // Create a template for feedback analysis
  const feedbackTemplate = {
    metadata: {
      collectionDate: new Date().toISOString(),
      platform: 'Music Streaming Platform',
      testingPhase: 'Initial User Testing'
    },
    categories: {
      bugs: [],
      featureRequests: [],
      uxIssues: [],
      performance: [],
      general: []
    },
    summary: {
      totalFeedback: 0,
      criticalIssues: 0,
      improvements: 0,
      positiveComments: 0
    }
  };
  
  // Save template
  const templatePath = path.join(__dirname, '../feedback-analysis-template.json');
  fs.writeFileSync(templatePath, JSON.stringify(feedbackTemplate, null, 2));
  
  console.log(`✅ Feedback analysis template saved to: ${templatePath}`);
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('1. Deploy your app for easier testing');
  console.log('2. Send invitation emails to testers');
  console.log('3. Monitor feedback through the widget');
  console.log('4. Collect and analyze feedback regularly');
  console.log('5. Prioritize fixes based on frequency and severity');
}

// Helper function to analyze feedback (if you have feedback data)
function analyzeFeedback(feedbackArray) {
  if (!Array.isArray(feedbackArray)) {
    console.log('❌ No valid feedback data provided');
    return;
  }
  
  console.log(`📊 Analyzing ${feedbackArray.length} feedback items...\n`);
  
  const analysis = {
    totalItems: feedbackArray.length,
    pages: {},
    timeRange: {
      earliest: null,
      latest: null
    },
    commonWords: {},
    browsers: {}
  };
  
  feedbackArray.forEach(item => {
    // Page analysis
    if (item.page) {
      analysis.pages[item.page] = (analysis.pages[item.page] || 0) + 1;
    }
    
    // Time analysis
    if (item.timestamp) {
      const date = new Date(item.timestamp);
      if (!analysis.timeRange.earliest || date < analysis.timeRange.earliest) {
        analysis.timeRange.earliest = date;
      }
      if (!analysis.timeRange.latest || date > analysis.timeRange.latest) {
        analysis.timeRange.latest = date;
      }
    }
    
    // Word frequency
    if (item.feedback) {
      const words = item.feedback.toLowerCase().split(/\W+/);
      words.forEach(word => {
        if (word.length > 3) {
          analysis.commonWords[word] = (analysis.commonWords[word] || 0) + 1;
        }
      });
    }
    
    // Browser analysis
    if (item.userAgent) {
      let browser = 'Unknown';
      if (item.userAgent.includes('Chrome')) browser = 'Chrome';
      else if (item.userAgent.includes('Firefox')) browser = 'Firefox';
      else if (item.userAgent.includes('Safari')) browser = 'Safari';
      else if (item.userAgent.includes('Edge')) browser = 'Edge';
      
      analysis.browsers[browser] = (analysis.browsers[browser] || 0) + 1;
    }
  });
  
  // Display results
  console.log('📈 Feedback Analysis Results:');
  console.log('============================');
  console.log(`Total Feedback Items: ${analysis.totalItems}`);
  console.log('');
  
  console.log('📍 Pages with Most Feedback:');
  Object.entries(analysis.pages)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([page, count]) => {
      console.log(`  ${page}: ${count} items`);
    });
  console.log('');
  
  console.log('🔤 Most Common Words:');
  Object.entries(analysis.commonWords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([word, count]) => {
      console.log(`  ${word}: ${count} times`);
    });
  console.log('');
  
  console.log('🌐 Browser Usage:');
  Object.entries(analysis.browsers).forEach(([browser, count]) => {
    console.log(`  ${browser}: ${count} users`);
  });
  console.log('');
  
  if (analysis.timeRange.earliest && analysis.timeRange.latest) {
    console.log('📅 Testing Period:');
    console.log(`  From: ${analysis.timeRange.earliest.toLocaleDateString()}`);
    console.log(`  To: ${analysis.timeRange.latest.toLocaleDateString()}`);
  }
}

// If run directly
if (require.main === module) {
  collectFeedback();
}

module.exports = { collectFeedback, analyzeFeedback };
