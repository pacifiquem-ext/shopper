# Marketplace

A single marketplace where shoppers browse products from merchant stores and merchants fulfill orders from one dashboard.

## Language

**Shopper profile**:
A first-party record of one visitor’s marketplace signals, keyed by a visitor id rather than a third-party tracker.
_Avoid_: cookie profile, recommendation user, analytics identity

**Shopper signal**:
An observed shopper action used to update a shopper profile: search, product view, category view, store view, cart add, wishlist, or purchase.
_Avoid_: event, click, impression

**Discovery ranking**:
The scored order of catalog products that blends search relevance with shopper-profile affinity.
_Avoid_: sort, feed, recommendation list

**Visitor id**:
An anonymous first-party identifier stored in a shopper cookie and sent with catalog requests.
_Avoid_: session id, user id, device id
