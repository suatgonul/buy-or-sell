/**
 * Injects parameters to the template string. Strings would be like: 'some string {0} some more string {1}'
 * Placeholder are represented by {<number>} where the number starts from 0 (zero). Parameters are injected in order
 * @param template
 * @param params
 */
export function formatString(template: string, ...params: any) {
  return template.replace(/{(\d+)}/g, function(match, number) {
    return typeof params[number] !== 'undefined'
      ? params[number]
      : match
      ;
  });
}