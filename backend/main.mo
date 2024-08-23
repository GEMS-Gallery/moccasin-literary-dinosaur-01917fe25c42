import Hash "mo:base/Hash";

import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor {
  type File = {
    name: Text;
    content: Blob;
    size: Nat;
    uploadTime: Time.Time;
  };

  stable var userFilesEntries : [(Principal, [(Text, File)])] = [];
  var userFiles = HashMap.HashMap<Principal, HashMap.HashMap<Text, File>>(0, Principal.equal, Principal.hash);

  public shared(msg) func uploadFile(name: Text, content: Blob) : async Result.Result<(), Text> {
    let caller = msg.caller;
    let file : File = {
      name = name;
      content = content;
      size = Blob.toArray(content).size();
      uploadTime = Time.now();
    };

    switch (userFiles.get(caller)) {
      case null {
        let newUserFiles = HashMap.HashMap<Text, File>(0, Text.equal, Text.hash);
        newUserFiles.put(name, file);
        userFiles.put(caller, newUserFiles);
      };
      case (?existingFiles) {
        existingFiles.put(name, file);
      };
    };

    #ok(())
  };

  public shared(msg) func listFiles() : async [File] {
    let caller = msg.caller;
    switch (userFiles.get(caller)) {
      case null { [] };
      case (?files) {
        Iter.toArray(files.vals())
      };
    }
  };

  public shared(msg) func deleteFile(name: Text) : async Result.Result<(), Text> {
    let caller = msg.caller;
    switch (userFiles.get(caller)) {
      case null { #err("User has no files") };
      case (?files) {
        switch (files.remove(name)) {
          case null { #err("File not found") };
          case _ { #ok(()) };
        }
      };
    }
  };

  system func preupgrade() {
    userFilesEntries := Iter.toArray(
      Iter.map<(Principal, HashMap.HashMap<Text, File>), (Principal, [(Text, File)])>(
        userFiles.entries(),
        func (entry : (Principal, HashMap.HashMap<Text, File>)) : (Principal, [(Text, File)]) {
          (entry.0, Iter.toArray(entry.1.entries()))
        }
      )
    );
  };

  system func postupgrade() {
    userFiles := HashMap.fromIter<Principal, HashMap.HashMap<Text, File>>(
      Iter.map<(Principal, [(Text, File)]), (Principal, HashMap.HashMap<Text, File>)>(
        userFilesEntries.vals(),
        func (entry : (Principal, [(Text, File)])) : (Principal, HashMap.HashMap<Text, File>) {
          (entry.0, HashMap.fromIter<Text, File>(entry.1.vals(), 10, Text.equal, Text.hash))
        }
      ),
      10,
      Principal.equal,
      Principal.hash
    );
    userFilesEntries := [];
  };
}
