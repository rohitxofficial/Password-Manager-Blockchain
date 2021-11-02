const PubNub = require("pubnub");

const credentials = {
  publishKey: "pub-c-d24d69e9-06c3-44bf-9c17-20ed980c0ebc",
  subscribeKey: "sub-c-41254f3c-2695-11ec-a401-fa2d187f6aa6",
  secretKey: "sec-c-OGUxYzI0NGYtYzg0OC00Yzk3LTg2YTgtODFjNDA1NGNiYTVk",
};

const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
};

class PubSub {
  constructor({ blockchain }) {
    this.blockchain = blockchain;

    this.pubnub = new PubNub(credentials);

    this.pubnub.subscribe({ channels: Object.values(CHANNELS) });

    this.pubnub.addListener(this.listener());
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }

  listener() {
    return {
      message: (messageObject) => {
        const { channel, message } = messageObject;

        console.log(
          "Message reveived. Channel: " + channel + ". Message: " + message
        );

        const parsedMessage = JSON.parse(message);

        if (channel === CHANNELS.BLOCKCHAIN) {
          this.blockchain.replaceChain(parsedMessage);
        }
      },
    };
  }

  publish({ channel, message }) {
    this.pubnub.publish({ channel, message });
  }
}

module.exports = PubSub;
