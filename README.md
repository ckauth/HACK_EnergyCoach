# Motivation

Do you know how your beer in the fridge, your cake in the stove, or your movie night, shape your electricity bill? This largely depends on the energy efficiency of your electrical appliances, which in turn is documented by their [energy label](https://en.wikipedia.org/wiki/European_Union_energy_label). Yet few people are familiar with the units employed by these labels, like kilo-watt-hours per year. 

What if you could have these labels' facts about energy consumption translated into money on your electricity bill? I took on that challenge by developing a _bot_, who understands such labels and explains how an appliance shapes your electricity bill. 

![Overview](https://github.com/ckauth/HACK_EnergyCoach/blob/master/illustrations/energy_coach.png)

# Achievements

At the end of an inspiring and intense 24h, stands _Energy Coach_, a bot that empowers you to make informed purchases of electrical appliances, generally (like illustrated on Cortana) and at the shop (like demoed on Skype).

![Demo Cortana](https://github.com/ckauth/HACK_EnergyCoach/blob/master/illustrations/demo_cortana.gif "on Cortana")   ![Demo Skype](https://github.com/ckauth/HACK_EnergyCoach/blob/master/illustrations/demo_skype.gif "on Skype")

HACK_EnergyCoach/illustrations/demo_cortana.gif 

Energy Coach
* Is your contact on Cortana or Skype
* Understands your intent thanks to [natural language processing](https://www.luis.ai/)
* Sees the appliance’s label through your phone’s camera
* Understands the label thanks to [optical character recognition](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/)
* Explains how the label impacts your electricity bill

# Award

I am honored to being awarded the second prize of the [_BlueArk Challenge 2018 - Energy Digitalization_](https://blueark-challenge.ch/en/)

![Award](https://github.com/ckauth/HACK_EnergyCoach/blob/master/illustrations/award.jpg|height=300)

# User Guide

The project is written in Javascript and leverages Microsoft's [Bot Builder SDK](https://dev.botframework.com/). Natural language is build into the bot thanks to [LUIS](https://www.luis.ai/home), and the label reading uses [OCR](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/) under the hood. The bot has been deployed to the [Azure computing cloud](https://azure.microsoft.com/en-us/) as a web app.

To spin this code up, you'll need to seed the XXX file with your personal credentials.





