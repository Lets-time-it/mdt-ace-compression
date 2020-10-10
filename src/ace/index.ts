import { Deserialize as V1Deserialize, Serialize as V1Serialize } from './revisions/v1';
import { LuaTypes } from './luaTypes';

const Deserialize = (content:string):LuaTypes => {
  const actualContent = content.replace(/\[[^\]]+\]/ig, '');
  const re = /(^.)([^^]*)/i;
  const result = re.exec(actualContent);
  if (!result) {
    throw Error('Data is not AceSerializer data');
  }
  switch (result[0]) {
    case '^1':
      return V1Deserialize(actualContent.substr(re.lastIndex + 2));
    default:
      throw Error(`Unknown AceSerializer data revision ${result}`);
  }
};
const Serialize = (data:Record<string, unknown>):string => V1Serialize(data, false);
const exporting = { Serialize, Deserialize };

export default exporting;
