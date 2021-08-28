import content from '!!raw-loader!../ts/tsconfig.json';
import '!!ts-loader!../ts';

console.log('loader-ts');
console.log(content);