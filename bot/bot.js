// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is your main bot dialog entry point for handling activity types

// Import required Bot Builder
const { ActivityTypes } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');

// import dialogs
const { EstimateDialog } = require('./dialogs/estimate');
const { ExplainDialog } = require('./dialogs/explain');

// State Accessor Properties
const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_PROFILE_PROPERTY = 'userProfileProperty';

// Dialog ID
const ESTIMATE_DIALOG = 'estimateDialog';
const EXPLAIN_DIALOG = 'explainDialog';

// LUIS service type entry as defined in the .bot file.
const LUIS_CONFIGURATION = 'BasicBotLuisApplication';

// Supported LUIS Intents.
const NONE_INTENT = 'None';
const ESTIMATE_INTENT = 'Estimate';
const EXPLAIN_INTENT = 'Explain';

class BasicBot {
    /**
     * Constructs the three pieces necessary for this bot to operate:
     * 1. StatePropertyAccessor for conversation state
     * 2. StatePropertyAccess for user state
     * 3. LUIS client
     * 4. DialogSet to handle our GreetingDialog
     *
     * @param {ConversationState} conversationState property accessor
     * @param {UserState} userState property accessor
     * @param {BotConfiguration} botConfig contents of the .bot file
     */
    constructor(conversationState, userState, botConfig) {
        if (!conversationState) throw new Error('Missing parameter.  conversationState is required');
        if (!userState) throw new Error('Missing parameter.  userState is required');
        if (!botConfig) throw new Error('Missing parameter.  botConfig is required');

        // Add the LUIS recognizer.
        const luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION);
        if (!luisConfig || !luisConfig.appId) throw new Error('Missing LUIS configuration. Please follow README.MD to create required LUIS applications.\n\n');
        this.luisRecognizer = new LuisRecognizer({
            applicationId: luisConfig.appId,
            endpoint: luisConfig.getEndpoint(),
            // CAUTION: Its better to assign and use a subscription key instead of authoring key here.
            endpointKey: luisConfig.authoringKey
        });

        // Create the property accessors for user and conversation state
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);
        this.dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);

        // Create top-level dialog(s)
        this.dialogs = new DialogSet(this.dialogState);
        // Add the Extimate and Explain dialogs to the set
        this.dialogs.add(new EstimateDialog(ESTIMATE_DIALOG, this.userProfileAccessor));
        this.dialogs.add(new ExplainDialog(EXPLAIN_DIALOG, this.userProfileAccessor));

        this.conversationState = conversationState;
        this.userState = userState;
    }

    /**
     * Driver code:
     *
     * @param {Context} context turn context from the adapter
     */
    async onTurn(context) {
        // Handle Message activity type, which is the main activity type for shown within a conversational interface
        // Message activities may contain text, speech, interactive cards, and binary or unknown attachments.
        // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
        if (context.activity.type === ActivityTypes.Message) {
            let dialogResult;
            // Create a dialog context
            const dc = await this.dialogs.createContext(context);

            // Perform a call to LUIS to retrieve results for the current activity message.
            const results = await this.luisRecognizer.recognize(context);
            var device;
            if (results.hasOwnProperty('entities')){
                if (results.entities.hasOwnProperty('device')){
                    device = results.entities.device[0];
                }
            }
            const topIntent = LuisRecognizer.topIntent(results);

            // we do not handle interruptions
            dialogResult = await dc.continueDialog();

            // If no active dialog or no active dialog has responded,
            if (!dc.context.responded) {
                // Switch on return results from any active dialog.
                switch (dialogResult.status) {
                // dc.continueDialog() returns DialogTurnStatus.empty if there are no active dialogs
                case DialogTurnStatus.empty:
                    // Determine what we should do based on the top intent from LUIS.
                    switch (topIntent) {
                    case ESTIMATE_INTENT:
                        await dc.beginDialog(ESTIMATE_DIALOG);
                        break;
                    case EXPLAIN_INTENT:
                        await dc.beginDialog(EXPLAIN_DIALOG);
                        break;
                    case NONE_INTENT:
                    default:
                        // None or no intent identified, either way, let's provide some help
                        // to the user
                      //  await dc.context.sendActivity({
                      //      text: `I didn't understand what you just said to me.`,
                      //      speak: `Sorry, can you say that again?`});
                        break;
                    }
                    break;
                default:
                    // Unrecognized status from child dialog. Cancel all dialogs.
                    await dc.cancelAllDialogs();
                    break;
                }
            }
        } else if (context.activity.type === ActivityTypes.ConversationUpdate) {
            // Handle ConversationUpdate activity type, which is used to indicates new members add to
            // the conversation.
            // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types

            // Do we have any new members added to the conversation?
            if (context.activity.membersAdded.length !== 0) {
                // Iterate over all new members added to the conversation
                for (var idx in context.activity.membersAdded) {
                    // Greet anyone that was not the target (recipient) of this message
                    // the 'bot' is the recipient for events from the channel,
                    // context.activity.membersAdded == context.activity.recipient.Id indicates the
                    // bot was added to the conversation.
                    if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {
                        // Welcome user.
                        // When activity type is "conversationUpdate" and the member joining the conversation is the bot
                        // we will send our Welcome Adaptive Card.  This will only be sent once, when the Bot joins conversation
                        // To learn more about Adaptive Cards, see https://aka.ms/msbot-adaptivecards for more details.
                        //const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                        //await context.sendActivity({ attachments: [welcomeCard] });
                        await context.sendActivity({
                            text:`Hi Christian`,
                            speak:`Hi Christian`});
                    }
                }
            }
        }

        // make sure to persist state at the end of a turn.
        await this.conversationState.saveChanges(context);
        await this.userState.saveChanges(context);
    }
}

module.exports.BasicBot = BasicBot;
