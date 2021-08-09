import chatMessage from '../../../components/chatMessage.js';
import { getUserSteamInventory } from '../../../components/inventory.js';
import log from '../../../components/log.js';
import messages from '../../../config/messages.js';
import prices from '../../../config/rates.js';

export default async (sender) => {
  try {
    log.userChat(sender.getSteamID64(), `[ !SELLCHECK ]`);
    chatMessage(sender, messages.request);

    const { regularCards, foilCards, boosterPacks } =
      await getUserSteamInventory(sender.getSteamID64());

    const items = {
      regularCards: {
        marketable: {
          quantity: 0,
          gems: 0,
        },
        nomarketable: { quantity: 0, gems: 0 },
      },
      foilCards: {
        marketable: { quantity: 0, gems: 0 },
        nomarketable: { quantity: 0, gems: 0 },
      },
      boosterPacks: {
        marketable: { quantity: 0, gems: 0 },
        nomarketable: { quantity: 0, gems: 0 },
      },
    };

    for (let i = 5; i <= 15; i += 1) {
      items.regularCards.marketable.quantity +=
        regularCards.marketable[i].length;
      items.regularCards.marketable.gems +=
        prices.gems[i].regularCards.marketable *
        regularCards.marketable[i].length;

      items.regularCards.nomarketable.quantity +=
        regularCards.nomarketable[i].length;
      items.regularCards.nomarketable.gems +=
        prices.gems[i].regularCards.nomarketable *
        regularCards.nomarketable[i].length;

      items.foilCards.marketable.quantity += foilCards.marketable[i].length;
      items.foilCards.marketable.gems +=
        prices.gems[i].foilCards.marketable * foilCards.marketable[i].length;

      items.foilCards.nomarketable.quantity += foilCards.nomarketable[i].length;
      items.foilCards.nomarketable.gems +=
        prices.gems[i].foilCards.nomarketable *
        foilCards.nomarketable[i].length;

      items.boosterPacks.marketable.quantity +=
        boosterPacks.marketable[i].length;
      items.boosterPacks.marketable.gems +=
        prices.gems[i].boosterPacks.marketable *
        boosterPacks.marketable[i].length;

      items.boosterPacks.nomarketable.quantity +=
        boosterPacks.nomarketable[i].length;
      items.boosterPacks.nomarketable.gems +=
        prices.gems[i].boosterPacks.nomarketable *
        boosterPacks.nomarketable[i].length;
    }

    const totalCost =
      items.regularCards.marketable.gems +
      items.regularCards.nomarketable.gems +
      items.foilCards.marketable.gems +
      items.foilCards.nomarketable.gems +
      items.boosterPacks.marketable.gems +
      items.boosterPacks.nomarketable.gems;

    if (totalCost === 0) {
      chatMessage(sender, messages.error.outofstock.anything.them);
      return;
    }

    const regularCardsTotal =
      items.regularCards.marketable.quantity +
      items.regularCards.nomarketable.quantity;

    const regularCardsTotalCost =
      items.regularCards.marketable.gems + items.regularCards.nomarketable.gems;

    const foilCardsTotal =
      items.foilCards.marketable.quantity +
      items.foilCards.nomarketable.quantity;

    const foilCardsTotalCost =
      items.foilCards.marketable.gems + items.foilCards.nomarketable.gems;

    const boosterPacksTotal =
      items.boosterPacks.marketable.quantity +
      items.boosterPacks.nomarketable.quantity;

    const boosterPacksTotalCost =
      items.boosterPacks.marketable.gems + items.boosterPacks.nomarketable.gems;

    let regularCardsMSG = `• ${regularCardsTotal} Regular Card(s): `;
    let foilCardsMSG = `• ${foilCardsTotal} Foil Card(s): `;
    let boosterPacksMSG = `• ${boosterPacksTotal} Booster Pack(s): `;

    Object.keys(items).forEach((value) => {
      let msg = '';

      if (
        items[value].marketable.quantity &&
        items[value].nomarketable.quantity
      ) {
        msg += `${items[value].marketable.quantity} Marketables, ${items[value].nomarketable.quantity} Non-Marketables.`;
      } else if (items[value].marketable.quantity) {
        msg += `${items[value].marketable.quantity} Marketables.`;
      } else {
        msg += `${items[value].nomarketable.quantity} Non-Marketables.`;
      }

      if (value === 'regularCards') {
        regularCardsMSG += msg;
      }

      if (value === 'foilCards') {
        foilCardsMSG += msg;
      }

      if (value === 'boosterPacks') {
        boosterPacksMSG += msg;
      }
    });

    let message = `/pre You currently have: \n `;

    if (regularCardsTotal) {
      message += `${regularCardsMSG} \n `;
    }

    if (foilCardsTotal) {
      message += `${foilCardsMSG} \n `;
    }

    if (boosterPacksTotal) {
      message += `${boosterPacksMSG} \n `;
    }

    message += `\n - You can get up to ${totalCost} Gems for everything, with the following rates: \n `;

    if (
      (regularCardsTotal && foilCardsTotal) ||
      (regularCardsTotal && boosterPacksTotal) ||
      (foilCardsTotal && boosterPacksTotal)
    ) {
      message += ` • ${totalCost} Gems for everything. \n   └─ !sellall \n\n `;
    }

    if (regularCardsTotal) {
      message += ` • ${regularCardsTotalCost} Gems for ${regularCardsTotal} Regular Card(s). \n   └─ !sellcards \n\n `;
    }

    if (foilCardsTotal) {
      message += ` • ${foilCardsTotalCost} Gems for ${foilCardsTotal} Foil Card(s). \n   └─ !sellfoils \n\n `;
    }

    if (boosterPacksTotal) {
      message += ` • ${boosterPacksTotalCost} Gems for ${boosterPacksTotal} Booster Pack(s). \n   └─ !sellpacks \n\n `;
    }

    chatMessage(sender.getSteamID64(), message);
  } catch (error) {
    log.error(error.message);
  }
};
