/* eslint-disable eqeqeq */
import chatMessage from '../../../../components/chatMessage.js';
import {
  getTF2KeyByAmount,
  getUserSteamInventory,
} from '../../../../components/inventory.js';
import log from '../../../../components/log.js';
import makeOffer from '../../../../components/makeOffer.js';
import { client } from '../../../../components/steamClient.js';
import messages from '../../../../config/messages.js';
import prices from '../../../../config/rates.js';

export default async (sender, currency) => {
  try {
    log.userChat(sender.getSteamID64(), `[ !SELLALL ${currency} ]`);
    chatMessage(sender, messages.request);

    const { regularCards, foilCards, boosterPacks } =
      await getUserSteamInventory(sender.getSteamID64());

    const cards = [];
    const packs = [];
    let amountOfKeys = 0;

    for (let i = 5; i <= 15; i += 1) {
      amountOfKeys +=
        regularCards.marketable[i].length /
        prices.tf[i].regularCards.marketable;

      amountOfKeys +=
        regularCards.nomarketable[i].length /
        prices.tf[i].regularCards.nomarketable;

      amountOfKeys +=
        foilCards.marketable[i].length / prices.tf[i].foilCards.marketable;

      amountOfKeys +=
        foilCards.nomarketable[i].length / prices.tf[i].foilCards.nomarketable;

      amountOfKeys +=
        boosterPacks.marketable[i].length /
        prices.tf[i].boosterPacks.marketable;

      amountOfKeys +=
        boosterPacks.nomarketable[i].length /
        prices.tf[i].boosterPacks.nomarketable;
    }

    amountOfKeys = Number.parseInt(amountOfKeys, 10);

    let need = amountOfKeys;
    for (let i = 5; i <= 15; i += 1) {
      for (let j = 0; j < regularCards.marketable[i].length; j += 1) {
        const numberOfDigits = String(
          prices.tf[i].regularCards.marketable
        ).length;

        if (need.toFixed(numberOfDigits) > 0) {
          cards.push(regularCards.marketable[i][j]);
          need -= 1 / prices.tf[i].regularCards.marketable;
        } else {
          break;
        }
      }

      for (let j = 0; j < regularCards.nomarketable[i].length; j += 1) {
        const numberOfDigits = String(
          prices.tf[i].regularCards.nomarketable
        ).length;

        if (need.toFixed(numberOfDigits) > 0) {
          cards.push(regularCards.nomarketable[i][j]);

          need -= 1 / prices.tf[i].regularCards.nomarketable;
        } else {
          break;
        }
      }

      for (let j = 0; j < foilCards.marketable[i].length; j += 1) {
        const numberOfDigits = String(prices.tf[i].foilCards.marketable).length;

        if (need.toFixed(numberOfDigits) > 0) {
          cards.push(foilCards.marketable[i][j]);
          need -= 1 / prices.tf[i].foilCards.marketable;
        } else {
          break;
        }
      }

      for (let j = 0; j < foilCards.nomarketable[i].length; j += 1) {
        const numberOfDigits = String(
          prices.tf[i].foilCards.nomarketable
        ).length;

        if (need.toFixed(numberOfDigits) > 0) {
          cards.push(foilCards.nomarketable[i][j]);

          need -= 1 / prices.tf[i].foilCards.nomarketable;
        } else {
          break;
        }
      }

      for (let j = 0; j < boosterPacks.marketable[i].length; j += 1) {
        const numLength = String(prices.tf[i].boosterPacks.marketable).length;

        if (need.toFixed(numLength) > 0) {
          packs.push(boosterPacks.marketable[i][j]);
          need -= 1 / prices.tf[i].boosterPacks.marketable;
        } else {
          break;
        }
      }

      for (let j = 0; j < boosterPacks.nomarketable[i].length; j += 1) {
        const numLength = String(prices.tf[i].boosterPacks.nomarketable).length;

        if (need.toFixed(numLength) > 0) {
          packs.push(boosterPacks.nomarketable[i][j]);

          need -= 1 / prices.tf[i].boosterPacks.nomarketable;
        } else {
          break;
        }
      }
    }

    if (amountOfKeys === 0 || (cards.length === 0 && packs.length === 0)) {
      chatMessage(
        sender.getSteamID64(),
        messages.error.outofstock.anything.them
      );
      return;
    }

    const keys = await getTF2KeyByAmount(
      client.steamID.getSteamID64(),
      amountOfKeys
    );

    const message = messages.trade.message.everything[1].replace(
      '{KEYS}',
      amountOfKeys
    );

    await makeOffer(
      sender.getSteamID64(),
      [...keys],
      [...cards, ...packs],
      '!SELLALL',
      message,
      cards.length,
      amountOfKeys,
      0,
      packs.length
    );
  } catch (error) {
    if (error.message.includes('Insufficient number of key(s)')) {
      chatMessage(sender, messages.error.outofstock.keys.me);
    } else if (
      error.message.includes('An error occurred while getting trade holds')
    ) {
      chatMessage(sender, messages.error.tradehold);
      log.error(
        `An error occurred while getting trade holds: ${error.message}`
      );
    } else if (error.message.indexOf('There is a trade holds') > -1) {
      chatMessage(sender, messages.tradeHold);
      log.error(`There is a trade holds: ${error.message}`);
    } else {
      log.error(
        `An error occurred while sending trade offer: ${error.message}`
      );
      chatMessage(sender, messages.error.sendtrade);
    }
  }
};
