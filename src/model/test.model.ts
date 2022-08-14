import { Type } from '@/model/type';

type Response = {
  a: string;
};

interface IResponse {
  a: string;
}

class Res {
  a: string;
}

function Public(a: any, b: any) {}
function Mutate(a: any, b: any) {}

export class Abc {
  abc: Type;
  abc1: Res;
  abc2: IResponse;
  abc3: Response;

  // graphql ignore
  method(input: Type): any {
    return [{ a: '1' }];
  }

  // graphl pick up as Query
  @Public
  method2(input: Type): Response[] {
    return [{ a: '1' }];
  }

  // graphl pick up as Mutate
  @Mutate
  method3(input: Type): Response[] {
    return [{ a: '1' }];
  }
}
