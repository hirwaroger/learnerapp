import Map "mo:base/HashMap";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
// @verify
actor LearnerApp {
  // Admin management
  private stable var adminPrincipal : ?Principal = null;
  
  // Topics (notebook_id -> title)
  private stable var topicsEntries : [(Text, Text)] = [];
  private var topics : Map.HashMap<Text, Text> = 
    Map.fromIter<Text, Text>(topicsEntries.vals(), 10, Text.equal, Text.hash);

  // Chat history
  private stable var chatHistoryEntries : [(Text, Text)] = [];
  private var chatHistory : Map.HashMap<Text, Text> =
    Map.fromIter<Text, Text>(chatHistoryEntries.vals(), 10, Text.equal, Text.hash);

  // User sessions (userName -> timestamp)
  private stable var userSessionEntries : [(Text, Int)] = [];
  private var userSessions : Map.HashMap<Text, Int> =
    Map.fromIter<Text, Int>(userSessionEntries.vals(), 10, Text.equal, Text.hash);

  // Character type definition
  public type Character = {
    id: Text;
    name: Text;
    description: Text;
    imageBase64: Text;
    createdAt: Int;
  };

  // Characters storage (id -> Character)
  private stable var charactersEntries : [(Text, Character)] = [];
  private var characters : Map.HashMap<Text, Character> = 
    Map.fromIter<Text, Character>(charactersEntries.vals(), 10, Text.equal, Text.hash);

  system func preupgrade() {
    chatHistoryEntries := Iter.toArray(chatHistory.entries());
    topicsEntries := Iter.toArray(topics.entries());
    userSessionEntries := Iter.toArray(userSessions.entries());
    charactersEntries := Iter.toArray(characters.entries());
  };

  system func postupgrade() {
    chatHistory := Map.fromIter<Text, Text>(chatHistoryEntries.vals(), 10, Text.equal, Text.hash);
    topics := Map.fromIter<Text, Text>(topicsEntries.vals(), 10, Text.equal, Text.hash);
    userSessions := Map.fromIter<Text, Int>(userSessionEntries.vals(), 10, Text.equal, Text.hash);
    characters := Map.fromIter<Text, Character>(charactersEntries.vals(), 10, Text.equal, Text.hash);
  };

  // Admin functions
  public func setAdmin(caller: Principal) : async Bool {
    switch (adminPrincipal) {
      case null {
        adminPrincipal := ?caller;
        true
      };
      case (?_) { false };
    }
  };

  public func isAdmin(caller: Principal) : async Bool {
    switch (adminPrincipal) {
      case null { false };
      case (?admin) { Principal.equal(caller, admin) };
    }
  };

  public func addTopic(caller: Principal, notebookId: Text, title: Text) : async Bool {
    let admin = await isAdmin(caller);
    if (admin) {
      topics.put(notebookId, title);
      true
    } else {
      false
    }
  };

  public func removeTopic(caller: Principal, notebookId: Text) : async Bool {
    let admin = await isAdmin(caller);
    if (admin) {
      ignore topics.remove(notebookId);
      true
    } else {
      false
    }
  };

  public query func getTopics() : async [(Text, Text)] {
    Iter.toArray(topics.entries())
  };

  // User functions
  public func loginUser(userName: Text) : async Bool {
    if (Text.size(userName) > 0) {
      userSessions.put(userName, Time.now());
      true
    } else {
      false
    }
  };

  public query func isUserLoggedIn(userName: Text) : async Bool {
    switch (userSessions.get(userName)) {
      case null { false };
      case (?timestamp) { 
        let now = Time.now();
        let dayInNanos = 24 * 60 * 60 * 1000000000; // 24 hours
        (now - timestamp) < dayInNanos
      };
    }
  };

  // Chat functions
  public func storeChatMessage(sessionId: Text, message: Text) : async Bool {
    let timestamp = Int.toText(Time.now());
    let key = sessionId # "_" # timestamp;
    chatHistory.put(key, message);
    true
  };

  public query func getChatHistory(sessionId: Text) : async [Text] {
    let entries = Iter.toArray(chatHistory.entries());
    let filtered = Array.filter<(Text, Text)>(
      entries,
      func ((key, _)) = Text.startsWith(key, #text sessionId)
    );
    Array.map<(Text, Text), Text>(filtered, func ((_, value)) = value)
  };

  // Character management functions
  public func addCharacter(caller: Principal, id: Text, name: Text, description: Text, imageBase64: Text) : async Bool {
    let admin = await isAdmin(caller);
    if (admin) {
      let character: Character = {
        id = id;
        name = name;
        description = description;
        imageBase64 = imageBase64;
        createdAt = Time.now();
      };
      characters.put(id, character);
      true
    } else {
      false
    }
  };

  public func removeCharacter(caller: Principal, id: Text) : async Bool {
    let admin = await isAdmin(caller);
    if (admin) {
      ignore characters.remove(id);
      true
    } else {
      false
    }
  };

  public query func getCharacters() : async [Character] {
    let entries = Iter.toArray(characters.entries());
    Array.map<(Text, Character), Character>(entries, func ((_, character)) = character)
  };

  public query func getCharacter(id: Text) : async ?Character {
    characters.get(id)
  };

  public query func health() : async Text {
    "LearnerApp Backend is healthy"
  };
};