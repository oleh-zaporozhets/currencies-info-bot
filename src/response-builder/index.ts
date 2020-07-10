export default class {
  private response: string[] = [];

  public addLine = (text: string) => {
    this.response.push(text);
  };

  public addBoldLine = (text: string) => {
    this.response.push(`*${text}*`);
  };

  public addEmptyLine = () => {
    this.response.push('');
  };

  public getResponse = () => {
    const msg = this.response.join('\n');

    this.response = [];

    return msg;
  };
}
