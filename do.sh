#!/bin/bash
flow project start-emulator &

sleep 2

flow accounts create \
    --key e9a04d5ed0dbdce13a4ec7ea1d3928e509b56a30615b5b7e0aefafa494df55a2fb4a20899d74b364ac6ebe0dae4a1505ec004241fdea2d04fd8a722e10530e5b \
    --results

flow project deploy

flow transactions send --code=./cadence/transactions/mint_nft.cdc \
  --results \
  --args="[{\"type\": \"String\", \"value\": \"test metadataURI\"}]" \
  --signer emulator-account

flow transactions send --code=./cadence/transactions/get_nft.cdc \
  --results \
  --signer account1

flow scripts execute --code=./cadence/scripts/get_new_metadata.cdc --args="[ \
  {\"type\": \"Address\", \"value\": \"0x01cf0e2f2f715450\"} \
]"

flow transactions send --code=./cadence/transactions/propose_new_metadata.cdc \
  --results \
  --args="[ \
    {\"type\": \"UInt64\", \"value\": \"1\"}, \
    {\"type\": \"String\", \"value\": \"test metadataURI 2\"} \
  ]" \
  --signer emulator-account

flow scripts execute --code=./cadence/scripts/get_new_metadata.cdc --args="[ \
  {\"type\": \"Address\", \"value\": \"0x01cf0e2f2f715450\"} \
]"

flow transactions send --code=./cadence/transactions/accept_new_metadata.cdc \
  --results \
  --args="[{\"type\": \"UInt64\", \"value\": \"1\"}]" \
  --signer account1

flow scripts execute --code=./cadence/scripts/get_collection_ids.cdc --args="[ \
  {\"type\": \"Address\", \"value\": \"0x01cf0e2f2f715450\"} \
]"

flow scripts execute --code=./cadence/scripts/get_metadata.cdc --args="[ \
  {\"type\": \"Address\", \"value\": \"0x01cf0e2f2f715450\"}, \
  {\"type\": \"Array\", \"value\": [ \
    {\"type\": \"UInt64\", \"value\": \"1\"} \
  ]} \
]"

pkill -KILL -f "flow project start-emulator"
