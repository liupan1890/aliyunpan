import { IStatePanFile, IStateTreeItem } from 'src/store/models';

export function GetSorterFileList(filelist: IStatePanFile[], field: string, orderasc: boolean): IStatePanFile[] {
  if (field === 'ali') {
    if (orderasc) {
      return filelist.sort(function (a, b) {
        return a.name.localeCompare(b.name, 'zh-Hans');
      });
    } else {
      return filelist.sort(function (a, b) {
        return b.name.localeCompare(a.name, 'zh-Hans');
      });
    }
  } else if (field === 'name') {
    if (orderasc) {
      return filelist.sort(function (a, b) {
        return SortNumber(a.name, b.name);
      });
    } else {
      return filelist.sort(function (a, b) {
        return SortNumber(b.name, a.name);
      });
    }
  } else if (field === 'ext') {
    if (orderasc) {
      return filelist.sort(function (a, b) {
        return SortNumber(a.ext + ' ' + a.name, b.ext + ' ' + b.name);
      });
    } else {
      return filelist.sort(function (a, b) {
        return SortNumber(b.ext + ' ' + b.name, a.ext + ' ' + a.name);
      });
    }
  } else if (field === 'size') {
    if (orderasc) {
      return filelist.sort(function (a, b) {
        const s = a.size - b.size;
        if (s == 0) return SortNumber(a.name, b.name);
        else return s;
      });
    } else {
      return filelist.sort(function (a, b) {
        const s = b.size - a.size;
        if (s == 0) return SortNumber(b.name, a.name);
        else return s;
      });
    }
  } else {
    if (orderasc) {
      return filelist.sort(function (a, b) {
        const s = a.time - b.time;
        if (s == 0) return SortNumber(a.name, b.name);
        else return s;
      });
    } else {
      return filelist.sort(function (a, b) {
        const s = b.time - a.time;
        if (s == 0) return SortNumber(b.name, a.name);
        else return s;
      });
    }
  }
}

export function GetSorterDirList(filelist: IStateTreeItem[], field: string, orderasc: boolean): IStateTreeItem[] {
  if (field === 'time') {
    if (orderasc) {
      return filelist.sort(function (a, b) {
        const s = a.time - b.time;
        if (s == 0) return SortNumber(a.label, b.label);
        else return s;
      });
    } else {
      return filelist.sort(function (a, b) {
        const s = b.time - a.time;
        if (s == 0) return SortNumber(b.label, a.label);
        else return s;
      });
    }
  } else if (field === 'size') {
    if (orderasc) {
      return filelist.sort(function (a, b) {
        const s = a.size - b.size;
        if (s == 0) return SortNumber(a.label, b.label);
        else return s;
      });
    } else {
      return filelist.sort(function (a, b) {
        const s = b.size - a.size;
        if (s == 0) return SortNumber(b.label, a.label);
        else return s;
      });
    }
  } else {
    if (orderasc) {
      return filelist.sort(function (a, b) {
        return SortNumber(a.label, b.label);
      });
    } else {
      return filelist.sort(function (a, b) {
        return SortNumber(b.label, a.label);
      });
    }
  }
}

function replace(a: string): string {
  let b = '';
  let c = '';
  for (let i = 0; i < a.length; i++) {
    c = a[i];
    switch (c) {
      case '一':
        b += '1';
        break;
      case '二':
        b += '2';
        break;
      case '三':
        b += '3';
        break;
      case '四':
        b += '4';
        break;
      case '五':
        b += '5';
        break;
      case '六':
        b += '6';
        break;
      case '七':
        b += '7';
        break;
      case '八':
        b += '8';
        break;
      case '九':
        b += '9';
        break;
      default:
        b += c;
    }
  }
  return b;
}

export function SortNumber(a: string, b: string): number {
  a = replace(a);
  b = replace(b);
  const aNums = a.match(/[0-9]+/g);
  const bNums = b.match(/[0-9]+/g);

  if (!aNums || !bNums) {
    return a.localeCompare(b, 'zh-Hans');
  }
  for (let i = 0, minLen = Math.min(aNums.length, bNums.length); i < minLen; i++) {
    const aIndex = a.indexOf(aNums[i]);
    const bIndex = b.indexOf(bNums[i]);

    const aPrefix = a.substring(0, aIndex);
    const bPrefix = b.substring(0, bIndex);

    if (aIndex !== bIndex || aPrefix !== bPrefix) {
      return a.localeCompare(b, 'zh-Hans');
    }

    if (aNums[i] === bNums[i]) {
      if (i === minLen - 1) {
        return a.substring(aIndex).localeCompare(b.substring(bIndex), 'zh-Hans');
      } else {
        a = a.substring(aIndex + aNums[i].length);
        b = b.substring(bIndex + bNums[i].length);
      }
    } else if (~~aNums[i] === ~~bNums[i]) {
      return aNums[i].lastIndexOf((~~aNums[i]).toString()) - bNums[i].lastIndexOf((~~bNums[i]).toString());
    } else {
      return ~~aNums[i] - ~~bNums[i];
    }
  }
  return a.localeCompare(b, 'zh-Hans');
}
