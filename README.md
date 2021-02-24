# node-red-contrib-techulus-push
A [Node-RED][1] node to send notifications via [Techulus Push][2].

## Install

Run the following command in the root directory of your Node-RED instance,
typically `~/.node-red`.

```
npm install --save node-red-contrib-techulus-push
```

## Usage

Uses [Techulus Push][2] to send `msg.payload` to all the devices registered in
your account.

- Uses `msg.topic` to set the title, if not already set in the properties.
- Optionally uses `msg.link` to set the link, if not already set in the
  properties.

### Configuration

Copy your API key from your [Techulus Push][2] dashboard to the `API Key`
field in the node properties.

## References

- REST API Reference: https://docs.push.techulus.com/api-documentation

[1]: https://nodered.org
[2]: https://push.techulus.com/
