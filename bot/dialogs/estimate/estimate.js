'use strict';

var rp = require('request-promise');

// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, AttachmentPrompt, ChoicePrompt } = require('botbuilder-dialogs');

// Dialog IDs 
const ESTIMATE_DIALOG = 'estimateDialog';

// Prompt IDs
const AVAILABILITY_PROMPT = 'availabilityPrompt';
const LABEL_PROMPT = 'LabelPrompt';

// the key for your Azure Cognitive Service Computer Vision API'
const subscriptionKey = '<the_key_for_your_Azure_Cognitive_Service_Computer_Vision_API>'

class Estimate extends ComponentDialog {
    constructor(dialogId) {
        super(dialogId);

        // validate what was passed in
        if (!dialogId) throw ('Missing parameter.  dialogId is required');
        
        // Add a water fall dialog with 3 steps.
        this.addDialog(new WaterfallDialog(ESTIMATE_DIALOG, [
            this.promptForAvailability.bind(this),
            this.endConversationIfNoLabel.bind(this),
            this.analyzeLabel.bind(this)
        ]));

        // Add text prompts for label availability and label upload
        this.addDialog(new ChoicePrompt(AVAILABILITY_PROMPT));
        this.addDialog(new AttachmentPrompt(LABEL_PROMPT));
    }

    /**
     * Waterfall Dialog step function.
     *
     * Using a choice prompt, prompt the user for whether or not she has an energy label
     * 
     * @param {WaterfallStepContext} step contextual information for the current step being executed
     */
    async promptForAvailability(step) {
        const promptOptions = {
            prompt: `Would you have the energy label?`,
            reprompt: `That is not a valid answer. Say 'yes' or 'no'`,
            choices: ['yes', 'no']
        };
        return await step.prompt(AVAILABILITY_PROMPT, promptOptions);
    }

    /**
     * Waterfall Dialog step function.
     *
     * If the user has an energy label,
     *   using an attachment prompt, prompt the user for the energy label,
     * Else
     *   inform about the average costs.
     *
     * @param {WaterfallStepContext} step contextual information for the current step being executed
     */
    async endConversationIfNoLabel(step) {
        let availability = step.result;
        if (availability.value == 'no') {
            // Todo: Get 'device' entity from LUIS and inform about the inquired device (default=fridge)
            await step.context.sendActivity(
                'An average fridge consumes about 60 CHF worth of electricity per year.',
                `An average fridge consumes about 60 CHF worth of electricity per year.`
                )
            return await step.endDialog();
        }
        else {
            const promptOptions = {
                prompt: `Alright, show me.`,
                reprompt: `Please upload the label`
            };
            return await step.prompt(LABEL_PROMPT, promptOptions);
        }
    }

    /**
     * Waterfall Dialog step function.
     *
     * Use Microsoft Cognitive Service's computer vision API for optial character recognition to extract the consumption from the photo.
     *
     * @param {WaterfallStepContext} step contextual information for the current step being executed
     */
    async analyzeLabel(step) {
        let label = step.result[0];
        //await step.context.sendActivity(label.contentUrl);
        let consumptionPerYear = await this.ocr(label.contentUrl);
        let pricePerKwh = 0.2;
        let costPerYear = consumptionPerYear*pricePerKwh;
        await step.context.sendActivity(`This fridge consumes yearly ${costPerYear} CHF in electricity.`);
        return await step.endDialog();
    }

    async ocr(imageUrl) {
        // You must use the same location in your REST call as you used to get your
        // subscription keys. For example, if you got your subscription keys from
        // westus, replace "westcentralus" in the URL below with "westus".
        const uriBase = 'https://westeurope.api.cognitive.microsoft.com/vision/v2.0/ocr';

        // Todo: the imageUrl received from skype certainly points to the image, but that image is not publicly accessible.
        // As a workaround for the demo, I use this default label of a fridge for ocr. One solution to circumvent this temporary limitation,
        // would be to save the image to an azure storage account and send its link to the ocr-algorithm.
        // - if run locally and tested in the botframework emulator, the imageurl is of type http://localhost:53450/v3/attachments/be4e32b0-eb35-11e8-a8a9-89117376918d/views/original
        // - if run on Azure, and tested in the webchat, the imageurl is of type https://webchat.botframework.com/attachments/96f6c3d20b154e4eb41a38f7f29541b6/0000005/0/fridge.png?t=CGAvTBLUqBw.dAA.OQA2AGYANgBjADMAZAAyADAAYgAxADUANABlADQAZQBiADQAMQBhADMAOABmADcAZgAyADkANQA0ADEAYgA2AC0AMAAwADAAMAAwADAANQA.Hfd82Ed_1AE.gStvKyQhxaA.keqPgZfx90DljXnFeVZzhjL4ky-KFzHhDXv0cHFZnX8
        // - if run on Azure, and tested on skype, the imageurl is of type https://smba.trafficmanager.net/apis/v3/attachments/0-weu-d11-3d20cd0b80b97cc3cd75cfd147d5fba7/views/original 
        const fridgeUrl = "https://uj0mfa.db.files.1drv.com/y4m9FyMwVjvaVG2wXZJSuBlNXnnAfrwtgB-_fSbVBpsmEq4cezXy8DbmBSyeewfl_ubppegfISXDYoUklU9VpLnNsL615ixbiAQkqmQAeK9YWqR3PilZHpckkB4DLVGAQoz8IdbJGShWSxbF8h3A-ecFqmyvHwW-XPhkZC5l3VBgYnCZzjW_CaIWky9RIQIffnjXhqL2yahyUIpj9Pl5ZB5hQ?width=222&height=445&cropmode=none";

        // Request parameters.
        const params = {
            'language': 'unk',
            'detectOrientation': 'true',
        };

        const options = {
            method: 'POST',
            uri: uriBase,
            qs: params,
            body: '{"url": ' + '"' + fridgeUrl + '"}',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key' : subscriptionKey
            }
        };

        return await rp(options)
            .then(function(body) {
                let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
                jsonResponse = JSON.parse(jsonResponse);
                let consumption;
                let regions = jsonResponse.regions;
                // find the number for consumption (kWh/annum)
                for (var region of regions) {
                    if(region.hasOwnProperty('lines')){
                        for (var line of region.lines) {
                            if(line.hasOwnProperty('words')){
                                for (var word of line.words) {
                                    if (word.text == "kWh/annum") {
                                        return consumption;
                                    }
                                    consumption = word.text;
                                }
                            }
                        }
                    }
                }
                return -1;
            })
            .catch(function (err) {
                console.log('Error: ', err);
                return;
            });
    }
}

exports.EstimateDialog = Estimate;
