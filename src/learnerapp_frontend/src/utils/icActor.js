import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// Define the IDL interface for your backend
const idlFactory = ({ IDL }) => {
  const Character = IDL.Record({
    'id': IDL.Text,
    'name': IDL.Text,
    'description': IDL.Text,
    'imageBase64': IDL.Text,
    'createdAt': IDL.Int,
  });

  return IDL.Service({
    'setAdmin': IDL.Func([IDL.Principal], [IDL.Bool], []),
    'isAdmin': IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'addTopic': IDL.Func([IDL.Principal, IDL.Text, IDL.Text], [IDL.Bool], []),
    'removeTopic': IDL.Func([IDL.Principal, IDL.Text], [IDL.Bool], []),
    'getTopics': IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))], ['query']),
    'addCharacter': IDL.Func([IDL.Principal, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    'removeCharacter': IDL.Func([IDL.Principal, IDL.Text], [IDL.Bool], []),
    'getCharacters': IDL.Func([], [IDL.Vec(Character)], ['query']),
    'getCharacter': IDL.Func([IDL.Text], [IDL.Opt(Character)], ['query']),
    'loginUser': IDL.Func([IDL.Text], [IDL.Bool], []),
    'isUserLoggedIn': IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'storeChatMessage': IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'getChatHistory': IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], ['query']),
    'health': IDL.Func([], [IDL.Text], ['query']),
  });
};

class ICBackend {
  constructor(identity = null) {
    this.identity = identity;
    this.actor = null;
    this.init();
  }

  async init() {
    const agent = new HttpAgent({
      identity: this.identity,
    });

    // Fetch root key for local development
    if (process.env.NODE_ENV !== 'production') {
      await agent.fetchRootKey();
    }

    // Replace with your actual canister ID
    const canisterId = process.env.CANISTER_ID_LEARNERAPP_BACKEND || 'rdmx6-jaaaa-aaaaa-aaadq-cai';

    this.actor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
  }

  async setAdmin() {
    if (!this.identity) throw new Error('Identity required for admin operations');
    const principal = this.identity.getPrincipal();
    return await this.actor.setAdmin(principal);
  }

  async isAdmin() {
    if (!this.identity) return false;
    const principal = this.identity.getPrincipal();
    return await this.actor.isAdmin(principal);
  }

  async addTopic(notebookId, title) {
    if (!this.identity) throw new Error('Identity required for admin operations');
    const principal = this.identity.getPrincipal();
    return await this.actor.addTopic(principal, notebookId, title);
  }

  async removeTopic(notebookId) {
    if (!this.identity) throw new Error('Identity required for admin operations');
    const principal = this.identity.getPrincipal();
    return await this.actor.removeTopic(principal, notebookId);
  }

  async getTopics() {
    return await this.actor.getTopics();
  }

  async addCharacter(id, name, description, imageBase64) {
    if (!this.identity) throw new Error('Identity required for admin operations');
    const principal = this.identity.getPrincipal();
    return await this.actor.addCharacter(principal, id, name, description, imageBase64);
  }

  async removeCharacter(id) {
    if (!this.identity) throw new Error('Identity required for admin operations');
    const principal = this.identity.getPrincipal();
    return await this.actor.removeCharacter(principal, id);
  }

  async getCharacters() {
    return await this.actor.getCharacters();
  }

  async getCharacter(id) {
    return await this.actor.getCharacter(id);
  }

  async loginUser(userName) {
    return await this.actor.loginUser(userName);
  }

  async isUserLoggedIn(userName) {
    return await this.actor.isUserLoggedIn(userName);
  }

  async storeChatMessage(sessionId, message) {
    return await this.actor.storeChatMessage(sessionId, message);
  }

  async getChatHistory(sessionId) {
    return await this.actor.getChatHistory(sessionId);
  }

  async health() {
    return await this.actor.health();
  }
}

export default ICBackend;
