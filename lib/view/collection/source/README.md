#This section is for technology implementation using Next JS
*It meant to go into @specfocus/next-focus*

## Recoil

Recoil is used for global state

*atomStore*

* It is an object tree (no arrays) of all collections by names and entities by key

*atomEdit*

* It is similar to atomCollections in structure but only containing un commited modifications to entities in atomCollections

*useForm*

* Similar to final forms but using atomCollections and atomModifications

*atomQuery*

* Collections of sorted key arrays for binary search { [collectionName:string]: { [filterName: string]: { [key: number]: Array<number> } } }

*atomSort*

* { [collectionName:string]: { [columnName: string]: { $: [key: number]: Array[number]; [columnName: string]: {} }

