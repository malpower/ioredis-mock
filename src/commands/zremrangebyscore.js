import { zrevrangebyscore } from './index';

export function zremrangebyscore(key, inputMax, inputMin) {
  const vals = zrevrangebyscore.call(this, key, inputMax, inputMin);

  const map = this.data.get(key);
  vals.forEach(val => {
    map.delete(val);
  });
  this.data.set(key, map);

  return vals.length;
}