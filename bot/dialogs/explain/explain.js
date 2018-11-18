'use strict';

const { CardFactory } = require('botbuilder');

// Import required Bot Builder
const { ComponentDialog, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');

// Dialog IDs 
const EXPLAIN_DIALOG = 'explainDialog';
const UNDERSTOOD_DIALOG = 'understoodDialog';

// Prompt IDs
const UNDERSTOOD_PROMPT = 'understoodPrompt';


class Explain extends ComponentDialog {
    constructor(dialogId, userProfileAccessor) {
        super(dialogId);

        // validate what was passed in
        if (!dialogId) throw ('Missing parameter.  dialogId is required');
        if (!userProfileAccessor) throw ('Missing parameter.  userProfileAccessor is required');

        // Add a water fall dialog with 2 steps.
        this.addDialog(new WaterfallDialog(UNDERSTOOD_DIALOG, [
            this.initializeStateStep.bind(this),
            this.byebye.bind(this),
        ]));

        // Add text prompts for name and city
        this.addDialog(new TextPrompt(UNDERSTOOD_PROMPT));
    }

    /**
     * Waterfall Dialog step function.
     * 
     * Send the fridge example to the user to illustrate the computation
     *
     * @param {WaterfallStepContext} step contextual information for the current step being executed
     */
    async initializeStateStep(step) {      
        await step.context.sendActivity({ attachments: [this.createHeroCard()] });
        await step.context.sendActivity({
            text:`kWh/annum, describes the energy used in a year.`,
            speak:`Look for the kilo watt hours per annum box, which hints the energy used in a year for the fridge running twenty-four seven.`
        });
        await step.context.sendActivity({
            text:`This fridge consumes 201 kWh per year`,
            speak:`This fridge consumes two hundred and one kilo watt hours per year.`
        });
        await step.context.sendActivity({
            text:`"Price" = "Energy units" x "Price per unit"`,
            speak:`The energy price is formed as the product of the energy units times the price per unit`
        });
        await step.context.sendActivity({
            text:`This price per unit is 20cts/kWh`,
            speak:`This price per unit is twenty cents per kilo watt hour`
        });
        await step.context.sendActivity({
            text:`201 x 0.20 = 40.2 CHF`,
            speak:`two hundred and one times point twenty equals about 40 swiss franks`
        });

        return await step.prompt(UNDERSTOOD_PROMPT);
    }

    /**
     * Waterfall Dialog step function.
     *
     * Whatever the user says, be polite
     *
     * @param {WaterfallStepContext} step contextual information for the current step being executed
     */
    async byebye(step) {
        await step.context.sendActivity({
            text:`My pleasure`,
            speak:`My pleasure`
        });
        return await step.endDialog();
    }
   
    /**
     * The a card with the fridge label as image
     */
    createHeroCard() {
        return CardFactory.heroCard(
            'Sample label of a fridge',
            CardFactory.images(['https://uj0mfa.db.files.1drv.com/y4m9FyMwVjvaVG2wXZJSuBlNXnnAfrwtgB-_fSbVBpsmEq4cezXy8DbmBSyeewfl_ubppegfISXDYoUklU9VpLnNsL615ixbiAQkqmQAeK9YWqR3PilZHpckkB4DLVGAQoz8IdbJGShWSxbF8h3A-ecFqmyvHwW-XPhkZC5l3VBgYnCZzjW_CaIWky9RIQIffnjXhqL2yahyUIpj9Pl5ZB5hQ?width=222&height=445&cropmode=none']));
    }
}

https://github.com/ckauth/HACK_EnergyCoach/blob/master/illustrations/fridge_label.png 

exports.ExplainDialog = Explain;
