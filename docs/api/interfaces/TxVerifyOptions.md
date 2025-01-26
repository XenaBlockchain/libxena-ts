[**libnexa-ts**](../index.md)

***

[libnexa-ts](../index.md) / TxVerifyOptions

# Interface: TxVerifyOptions

Contain a set of flags to skip certain tests:

* `disableAll`: disable all checks
* `disableIsFullySigned`: disable checking if all inputs are fully signed
* `disableDustOutputs`: disable checking if there are no outputs that are dust amounts
* `disableMoreOutputThanInput`: disable checking if the transaction spends more nexas than the sum of the input amounts

## Properties

| Property | Type |
| ------ | ------ |
| <a id="disableall"></a> `disableAll?` | `boolean` |
| <a id="disabledustoutputs"></a> `disableDustOutputs?` | `boolean` |
| <a id="disableisfullysigned"></a> `disableIsFullySigned?` | `boolean` |
| <a id="disablemoreoutputthaninput"></a> `disableMoreOutputThanInput?` | `boolean` |
