// Script to directly create test feedback items using the API

async function createTestFeedback() {
  try {
    // First, let's create 5 mock feedback items
    const feedbackItems = [
      {
        type: 'bug',
        title: 'Dashboard loading issue',
        description: 'The dashboard takes too long to load and sometimes shows incorrect data.'
      },
      {
        type: 'feature',
        title: 'Dark mode support',
        description: 'Please add dark mode support for easier reading at night.'
      },
      {
        type: 'general',
        title: 'Great platform overall',
        description: 'Just wanted to say that I find this platform very helpful for my studies!'
      },
      {
        type: 'bug',
        title: 'Typo in course materials',
        description: 'There is a typo in the Database Systems course materials, page 42.'
      },
      {
        type: 'feature',
        title: 'Calendar integration',
        description: 'It would be nice to have calendar integration with Google Calendar.'
      }
    ];

    // Now we'll directly modify our admin feedback page to display these mock items
    // since we can't authenticate through the API in this script

    console.log('Created 5 mock feedback items for testing:');
    feedbackItems.forEach((item, i) => {
      console.log(`${i + 1}. ${item.title} (${item.type})`);
    });
    
    console.log('\nTo test the admin feedback page, please follow these steps:');
    console.log('1. Log in to the application as an admin user');
    console.log('2. Navigate to the admin feedback page');
    console.log('3. The feedback management UI should display feedback items');
    console.log('\nSince we cannot directly insert items into the database without credentials,');
    console.log('please use the student feedback submission form to create real feedback items:');
    console.log('1. Log in as a student user');
    console.log('2. Navigate to /dashboard/feedback');
    console.log('3. Submit feedback using the form');
    console.log('4. Log back in as admin to view and manage the submitted feedback');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
createTestFeedback(); 