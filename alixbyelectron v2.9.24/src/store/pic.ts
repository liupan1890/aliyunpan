import { VuexModule, Module } from 'vuex-module-decorators';

interface IStatePic {
  headList: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
@Module({ namespaced: true, name: 'Pic', stateFactory: true })
export default class Pic extends VuexModule implements IStatePic {
  public headList = [];

  /*
  @Mutation
  updatePosts(posts: PostEntity[]) {
    this.posts = posts;
  }

  @Action({ commit: 'updatePosts' })
  async fetchPosts() {
    return get('https://jsonplaceholder.typicode.com/posts');
  }
  */
}
