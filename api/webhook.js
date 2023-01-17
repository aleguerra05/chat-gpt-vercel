// https://github.com/yagop/node-telegram-bot-api/issues/319#issuecomment-324963294
// Fixes an error with Promise cancellation
process.env.NTBA_FIX_319 = 'test';
const dotenv = require('dotenv');
const axios = require('axios');
var moment = require('moment')

// Require our Telegram helper package
const TelegramBot = require('node-telegram-bot-api');

// Export as an asynchronous function
// We'll wait until we've responded to the user
module.exports = async (request, response) => {
    try {
        // Create our new bot handler with the token
        // that the Botfather gave us
        // Use an environment variable so we don't expose it in our code
        const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

        // Retrieve the POST request body that gets sent from Telegram
        const { body } = request;

        // Ensure that this is a message being sent
        if (body.message) {
            // Retrieve the ID for this chat
            // and the text that the user sent
            const { chat: { id }, text } = body.message;

            var timestamp = moment().format('YYYY-MM-DD HH:mm:ss')

            console.log(timestamp +" "+body.message.from.username + ": "+ text);
            await bot.sendMessage(id,"...",{parse_mode: 'Markdown'});
            bot.sendChatAction(id, "typing");
            const message = await gptAnswer(text);

            timestamp = moment().format('YYYY-MM-DD HH:mm:ss')

            console.log(timestamp +" Reply to "+body.message.from.username+": "+message);


            // Create a message to send back
            // We can use Markdown inside this
            //const message = `✅ Thanks for your message: *"${text}"*\nHave a great day! 👋🏻`;

            // Send our new message back in Markdown and
            // wait for the request to finish
            await bot.sendMessage(id, message, {parse_mode: 'Markdown'});
        }
    }
    catch(error) {
        // If there was an error sending our message then we 
        // can log it into the Vercel console
        console.error('Error sending message');
        console.log(error.toString());
    }
    
    // Acknowledge the message with Telegram
    // by sending a 200 HTTP status code
    // The message here doesn't matter.
    response.send('OK');
};

async function gptAnswer(question) {
    try {
      const response = await axios.post('https://api.openai.com/v1/completions', {
          "model": "text-davinci-003",
          "prompt": question,
          "temperature": 0,
          "max_tokens": 4000,
          "top_p": 1,
          "frequency_penalty": 0,
          "presence_penalty": 0,
          "best_of":1,
          "stop":["\\n"]
        }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });
      //console.log(response.data);
      return response.data.choices[0].text;
      //console.log(response.data.choices[0].text.trim());
      
      
    } catch (error) {
      return error;       
      //console.error(error);
    }
  }