export function formatString(template: string, ...params: any) {
  return template.replace(/{(\d+)}/g, function(match, number) {
    return typeof params[number] !== 'undefined'
      ? params[number]
      : match
      ;
  });
}