export function padPath(source: string) {
  let path = source;

  if (source.startsWith("'./")) {
    path = path.replace("'./", "'./../");
  } else if (source.startsWith("'../")) {
    path = path.replace("'../", "'../../");
  }

  return path;
}
