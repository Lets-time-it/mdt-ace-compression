# MDT (and more generally, WoW add-on) serialization/deserialization library

This library aims to fill a gap in interfacing with the WoW add-on ecosystem. A number of add-on developers tend to use 
a combination of [Ace3 Serialize](https://www.wowace.com/projects/ace3/pages/api/ace-serializer-3-0) and 
[LibDeflate](https://www.curseforge.com/wow/addons/libdeflate) for serialization/deserialization when conveying 
information to other users over channels (guild/party/addon-specific), or when storing and retrieving data from LUA.

As it stands, in order to be able to understand most of the information encoded in such strings, we need to be able to 
parse it into a format that makes sense, and that we can take further.

## Ace3 ser/deser

Ace3 (with Ace serialization revision 1)'s goal is to be able to turn any LUA object into a serialized, but raw, 
representation. It bears a lot of resemblance to MessagePack, in that it obeys simple rules:

- Every object starts with a field identifying its type, followed by a field with its value
- These fields are **always** prepended with an opening preamble, but not necessarily explicitly closed
- All LUA types are covered, with map keys being their own sub-type

In terms of implementation, this library takes an Ace serialization string and returns the corresponding 
object:

- `string` for strings
- `number` for lua integers, floats and all other numeric types
- `boolean` for booleans
- `null` for null values
- `Record<string, unknown>` for maps and arrays (Lua does not have the concept of an array)

This is all done while leveraging the strongly typed nature of typescript, and providing all the tools 
required to ensure testability.

### Usage

To serialize, import, and call `Serialize`:

    import { Ace } from 'mdt-compression';

    const ser = async () => {
        console.log(await Ace.Serialize("This is a test"));
    };

Similarily, to deserialize, call `Deserialize`:

    import { Ace } from 'mdt-compression';

    const ser = async () => {
        console.log(await Ace.Deserialize("^1^F3^f-2"));
    };