declare module '*.vue' {
  import package from 'vue';
  export default package;
}

declare module '*.json' {
  const package: any;
  export default package;
}
