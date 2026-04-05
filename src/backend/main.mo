import Array "mo:core/Array";
import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type ID = Nat;

  ////////////////////
  //   Data Types   //
  ////////////////////

  type Niche = {
    #finance;
    #tech;
    #health;
    #gaming;
    #education;
    #entertainment;
    #lifestyle;
    #food;
    #travel;
    #other : Text;
  };

  type ScriptTone = {
    #educational;
    #entertaining;
    #motivational;
    #informative;
    #storytelling;
    #tutorial;
    #review;
    #commentary;
    #other : Text;
  };

  type ScriptStatus = {
    #idea;
    #scripted;
    #recorded;
    #published;
    #archived;
  };

  type RevenueSource = {
    #adsense;
    #sponsorship;
    #affiliate;
    #merchandise;
    #other : Text;
  };

  public type Channel = {
    id : ID;
    owner : Principal;
    name : Text;
    niche : Niche;
    description : Text;
    uploadFrequency : Text;
    targetAudience : Text;
  };

  public type ContentIdea = {
    id : ID;
    owner : Principal;
    title : Text;
    description : Text;
    tags : [Text];
    niche : Niche;
    status : ScriptStatus;
    createdAt : Int;
  };

  public type ScriptSection = {
    title : Text;
    content : Text;
  };

  public type VideoScript = {
    id : ID;
    owner : Principal;
    title : Text;
    niche : Niche;
    tone : ScriptTone;
    topic : Text;
    hook : ScriptSection;
    intro : ScriptSection;
    body : ScriptSection;
    callToAction : ScriptSection;
    createdAt : Int;
  };

  public type RevenueEntry = {
    id : ID;
    owner : Principal;
    channelId : ID;
    source : RevenueSource;
    amount : Float;
    currency : Text;
    date : Int;
    description : Text;
  };

  public type AnalyticsSnapshot = {
    id : ID;
    owner : Principal;
    channelId : ID;
    subscribers : Nat;
    totalViews : Nat;
    monthlyViews : Nat;
    monthlyRevenue : Float;
    date : Int;
  };

  // Dashboard Stats
  public type DashboardStats = {
    totalSubscribers : Nat;
    totalViews : Nat;
    totalRevenue : Float;
    totalVideos : Nat;
    totalIdeas : Nat;
  };

  // Internal User Profile (Persistent State)
  type UserProfile = {
    name : Text;
    channels : Set.Set<ID>;
    contentIdeas : Set.Set<ID>;
    scripts : Set.Set<ID>;
    revenueEntries : Set.Set<ID>;
    analyticsSnapshots : Set.Set<ID>;
    createdAt : Int;
  };

  module UserProfile {
    // View all user profile with name-based ordering
    public func compareByName(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Text.compare(profile1.name, profile2.name);
    };
  };

  // Immutable Public User Profile View (for API Exposure)
  public type UserProfileView = {
    name : Text;
    channels : [ID];
    contentIdeas : [ID];
    scripts : [ID];
    revenueEntries : [ID];
    analyticsSnapshots : [ID];
    createdAt : Int;
  };

  module UserProfileView {
    public func compareByName(profile1 : UserProfileView, profile2 : UserProfileView) : Order.Order {
      Text.compare(profile1.name, profile2.name);
    };

    /// Convert persistent UserProfile to public view.
    public func fromProfile(profile : UserProfile) : UserProfileView {
      {
        profile with
        channels = profile.channels.toArray();
        contentIdeas = profile.contentIdeas.toArray();
        scripts = profile.scripts.toArray();
        revenueEntries = profile.revenueEntries.toArray();
        analyticsSnapshots = profile.analyticsSnapshots.toArray();
      };
    };
  };

  /////////////
  //  State  //
  /////////////

  // Pre-incrementing ID counters for each type
  var nextChannelId = 100;
  var nextIdeaId = 1000;
  var nextScriptId = 5000;
  var nextRevenueId = 10000;
  var nextAnalyticsId = 20000;

  // Channel, Idea, Script, Revenue, Analytics Maps
  let channelMap = Map.empty<ID, Channel>();
  let ideaMap = Map.empty<ID, ContentIdea>();
  let scriptMap = Map.empty<ID, VideoScript>();
  let revenueMap = Map.empty<ID, RevenueEntry>();
  let analyticsMap = Map.empty<ID, AnalyticsSnapshot>();

  // User Profiles (mapped by Principal)
  let userProfileMap = Map.empty<Principal, UserProfile>();

  // Access control state for authentication and authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  //////////////////////////////////////////////
  //         Helper Functions (Internal)      //
  //////////////////////////////////////////////

  /// Internal helper to get the current time.
  func getCurrentTime() : Int {
    Time.now() / 1_000_000;
  };

  /// Internal helper to get a public user profile view by principal.
  func getUserProfileViewByPrincipal(p : Principal) : UserProfileView {
    let profile = switch (userProfileMap.get(p)) {
      case (null) {
        let defaultProfile : UserProfile = {
          name = "";
          channels = Set.empty<ID>();
          contentIdeas = Set.empty<ID>();
          scripts = Set.empty<ID>();
          revenueEntries = Set.empty<ID>();
          analyticsSnapshots = Set.empty<ID>();
          createdAt = getCurrentTime();
        };
        userProfileMap.add(p, defaultProfile);
        defaultProfile;
      };
      case (?profile) { profile };
    };
    UserProfileView.fromProfile(profile);
  };

  /// Internal helper to update a user profile.
  func updateUserProfilePrincipal(owner : Principal, newProfile : UserProfile) {
    userProfileMap.add(owner, newProfile);
  };

  //////////////////////////////////////////////
  //    User Profile Management Functions     //
  //////////////////////////////////////////////

  // Get the calling user's profile
  public query ({ caller }) func getCallerUserProfile() : async UserProfileView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    getUserProfileViewByPrincipal(caller);
  };

  // Get User Profile (by Principal)
  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfileView {
    getUserProfileViewByPrincipal(user);
  };

  // Create/Update your own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfileView) : async () {
    // Only allow users to update their own profile.
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    // Get current profile, or create a default one if it doesn't exist.
    let currentProfile = switch (userProfileMap.get(caller)) {
      case (null) {
        let defaultProfile : UserProfile = {
          name = "";
          channels = Set.empty<ID>();
          contentIdeas = Set.empty<ID>();
          scripts = Set.empty<ID>();
          revenueEntries = Set.empty<ID>();
          analyticsSnapshots = Set.empty<ID>();
          createdAt = getCurrentTime();
        };
        userProfileMap.add(caller, defaultProfile);
        defaultProfile;
      };
      case (?profile) { profile };
    };
    // Merge persistent data with new profile data, including converts arrays back to persistent sets.
    let updatedProfile : UserProfile = {
      currentProfile with
      name = profile.name;
      channels = Set.fromArray(profile.channels);
      contentIdeas = Set.fromArray(profile.contentIdeas);
      scripts = Set.fromArray(profile.scripts);
      revenueEntries = Set.fromArray(profile.revenueEntries);
      analyticsSnapshots = Set.fromArray(profile.analyticsSnapshots);
    };
    updateUserProfilePrincipal(caller, updatedProfile);
  };

  /////////////////////////////////////////////////////////
  //   CRUD Operations for Channels, Ideas, Scripts     //
  ////////////////////////////////////////////////////////
  public shared ({ caller }) func createChannel(name : Text, niche : Niche, desc : Text, uploadFreq : Text, targetAudience : Text) : async Channel {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create channels");
    };
    if (name.size() == 0) { Runtime.trap("Channel name must not be empty!") };
    let id = nextChannelId;
    nextChannelId += 1;

    let newChannel : Channel = {
      id;
      owner = caller;
      name;
      niche;
      description = desc;
      uploadFrequency = uploadFreq;
      targetAudience;
    };
    channelMap.add(id, newChannel);
    // Update user profile with new channel ID
    let currentProfile = switch (userProfileMap.get(caller)) {
      case (null) {
        let defaultProfile : UserProfile = {
          name = "";
          channels = Set.empty<ID>();
          contentIdeas = Set.empty<ID>();
          scripts = Set.empty<ID>();
          revenueEntries = Set.empty<ID>();
          analyticsSnapshots = Set.empty<ID>();
          createdAt = getCurrentTime();
        };
        userProfileMap.add(caller, defaultProfile);
        defaultProfile;
      };
      case (?profile) { profile };
    };
    let updatedChannels = currentProfile.channels.clone();
    updatedChannels.add(id);
    updateUserProfilePrincipal(
      caller,
      { currentProfile with channels = updatedChannels },
    );
    newChannel;
  };

  public query ({ caller }) func getChannel(id : ID) : async Channel {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view channels");
    };
    switch (channelMap.get(id)) {
      case (null) { Runtime.trap("Channel not found") };
      case (?channel) {
        if (channel.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own channels");
        };
        channel;
      };
    };
  };

  public query ({ caller }) func getAllChannels() : async [Channel] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all channels");
    };
    channelMap.values().toArray();
  };

  public query ({ caller }) func getMyChannels() : async [Channel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view channels");
    };
    let myChannels = List.empty<Channel>();
    for ((id, channel) in channelMap.entries()) {
      if (channel.owner == caller) {
        myChannels.add(channel);
      };
    };
    myChannels.toArray();
  };

  public shared ({ caller }) func updateChannel(id : ID, name : Text, niche : Niche, desc : Text, uploadFreq : Text, targetAudience : Text) : async Channel {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update channels");
    };
    if (name.size() == 0) { Runtime.trap("Channel name must not be empty!") };
    switch (channelMap.get(id)) {
      case (null) { Runtime.trap("Channel not found") };
      case (?channel) {
        if (channel.owner != caller) { Runtime.trap("You do not own this channel!") };
        let updatedChannel : Channel = {
          channel with
          name;
          niche;
          description = desc;
          uploadFrequency = uploadFreq;
          targetAudience;
        };
        channelMap.add(id, updatedChannel);
        updatedChannel;
      };
    };
  };

  public shared ({ caller }) func deleteChannel(id : ID) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete channels");
    };
    switch (channelMap.get(id)) {
      case (null) { Runtime.trap("Channel not found") };
      case (?channel) {
        if (channel.owner != caller) { Runtime.trap("You do not own this channel!") };
        channelMap.remove(id);
        let currentProfile = switch (userProfileMap.get(caller)) {
          case (null) {
            let defaultProfile : UserProfile = {
              name = "";
              channels = Set.empty<ID>();
              contentIdeas = Set.empty<ID>();
              scripts = Set.empty<ID>();
              revenueEntries = Set.empty<ID>();
              analyticsSnapshots = Set.empty<ID>();
              createdAt = getCurrentTime();
            };
            userProfileMap.add(caller, defaultProfile);
            defaultProfile;
          };
          case (?profile) { profile };
        };
        let updatedChannels = currentProfile.channels.clone();
        updatedChannels.remove(id);
        updateUserProfilePrincipal(
          caller,
          { currentProfile with channels = updatedChannels },
        );
      };
    };
  };

  //////////////////////////////////
  //      Content Ideas CRUD      //
  //////////////////////////////////

  public shared ({ caller }) func createContentIdea(title : Text, desc : Text, tags : [Text], niche : Niche, status : ScriptStatus) : async ContentIdea {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create content ideas");
    };
    if (title.size() == 0) { Runtime.trap("Title must not be empty!") };
    let id = nextIdeaId;
    nextIdeaId += 1;
    let newIdea : ContentIdea = {
      id;
      owner = caller;
      title;
      description = desc;
      tags;
      niche;
      status;
      createdAt = getCurrentTime();
    };
    ideaMap.add(id, newIdea);
    let currentProfile = switch (userProfileMap.get(caller)) {
      case (null) {
        let defaultProfile : UserProfile = {
          name = "";
          channels = Set.empty<ID>();
          contentIdeas = Set.empty<ID>();
          scripts = Set.empty<ID>();
          revenueEntries = Set.empty<ID>();
          analyticsSnapshots = Set.empty<ID>();
          createdAt = getCurrentTime();
        };
        userProfileMap.add(caller, defaultProfile);
        defaultProfile;
      };
      case (?profile) { profile };
    };
    let updatedIdeas = currentProfile.contentIdeas.clone();
    updatedIdeas.add(id);
    updateUserProfilePrincipal(
      caller,
      { currentProfile with contentIdeas = updatedIdeas },
    );
    newIdea;
  };

  public query ({ caller }) func getContentIdea(id : ID) : async ContentIdea {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view content ideas");
    };
    switch (ideaMap.get(id)) {
      case (null) { Runtime.trap("Content idea not found") };
      case (?idea) {
        if (idea.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own content ideas");
        };
        idea;
      };
    };
  };

  public query ({ caller }) func getAllContentIdeas() : async [ContentIdea] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all content ideas");
    };
    ideaMap.values().toArray();
  };

  public query ({ caller }) func getMyContentIdeas() : async [ContentIdea] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view content ideas");
    };
    let myIdeas = List.empty<ContentIdea>();
    for ((id, idea) in ideaMap.entries()) {
      if (idea.owner == caller) {
        myIdeas.add(idea);
      };
    };
    myIdeas.toArray();
  };

  public shared ({ caller }) func updateContentIdea(id : ID, title : Text, desc : Text, tags : [Text], niche : Niche, status : ScriptStatus) : async ContentIdea {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update content ideas");
    };
    if (title.size() == 0) { Runtime.trap("Title must not be empty!") };
    switch (ideaMap.get(id)) {
      case (null) { Runtime.trap("Content idea not found") };
      case (?idea) {
        if (idea.owner != caller) { Runtime.trap("You do not own this content idea!") };
        let updatedIdea : ContentIdea = {
          idea with
          title;
          description = desc;
          tags;
          niche;
          status;
        };
        ideaMap.add(id, updatedIdea);
        updatedIdea;
      };
    };
  };

  public shared ({ caller }) func deleteContentIdea(id : ID) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete content ideas");
    };
    switch (ideaMap.get(id)) {
      case (null) { Runtime.trap("Content idea not found") };
      case (?idea) {
        if (idea.owner != caller) { Runtime.trap("You do not own this content idea!") };
        ideaMap.remove(id);
        let currentProfile = switch (userProfileMap.get(caller)) {
          case (null) {
            let defaultProfile : UserProfile = {
              name = "";
              channels = Set.empty<ID>();
              contentIdeas = Set.empty<ID>();
              scripts = Set.empty<ID>();
              revenueEntries = Set.empty<ID>();
              analyticsSnapshots = Set.empty<ID>();
              createdAt = getCurrentTime();
            };
            userProfileMap.add(caller, defaultProfile);
            defaultProfile;
          };
          case (?profile) { profile };
        };
        let updatedIdeas = currentProfile.contentIdeas.clone();
        updatedIdeas.remove(id);
        updateUserProfilePrincipal(
          caller,
          { currentProfile with contentIdeas = updatedIdeas },
        );
      };
    };
  };

  /////////////////////////////////////
  //   Video Script CRUD Operations  //
  /////////////////////////////////////

  public shared ({ caller }) func createVideoScript(title : Text, niche : Niche, tone : ScriptTone, topic : Text, hook : ScriptSection, intro : ScriptSection, body : ScriptSection, callToAction : ScriptSection) : async VideoScript {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create video scripts");
    };
    if (title.size() == 0) { Runtime.trap("Title must not be empty!") };
    let id = nextScriptId;
    nextScriptId += 1;
    let newScript : VideoScript = {
      id;
      owner = caller;
      title;
      niche;
      tone;
      topic;
      hook;
      intro;
      body;
      callToAction;
      createdAt = getCurrentTime();
    };
    scriptMap.add(id, newScript);
    let currentProfile = switch (userProfileMap.get(caller)) {
      case (null) {
        let defaultProfile : UserProfile = {
          name = "";
          channels = Set.empty<ID>();
          contentIdeas = Set.empty<ID>();
          scripts = Set.empty<ID>();
          revenueEntries = Set.empty<ID>();
          analyticsSnapshots = Set.empty<ID>();
          createdAt = getCurrentTime();
        };
        userProfileMap.add(caller, defaultProfile);
        defaultProfile;
      };
      case (?profile) { profile };
    };
    let updatedScripts = currentProfile.scripts.clone();
    updatedScripts.add(id);
    updateUserProfilePrincipal(
      caller,
      { currentProfile with scripts = updatedScripts },
    );
    newScript;
  };

  public query ({ caller }) func getVideoScript(id : ID) : async VideoScript {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view video scripts");
    };
    switch (scriptMap.get(id)) {
      case (null) { Runtime.trap("Video script not found") };
      case (?script) {
        if (script.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own video scripts");
        };
        script;
      };
    };
  };

  public query ({ caller }) func getAllVideoScripts() : async [VideoScript] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all video scripts");
    };
    scriptMap.values().toArray();
  };

  public query ({ caller }) func getMyVideoScripts() : async [VideoScript] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view video scripts");
    };
    let myScripts = List.empty<VideoScript>();
    for ((id, script) in scriptMap.entries()) {
      if (script.owner == caller) {
        myScripts.add(script);
      };
    };
    myScripts.toArray();
  };

  public shared ({ caller }) func updateVideoScript(id : ID, title : Text, niche : Niche, tone : ScriptTone, topic : Text, hook : ScriptSection, intro : ScriptSection, body : ScriptSection, callToAction : ScriptSection) : async VideoScript {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update video scripts");
    };
    if (title.size() == 0) { Runtime.trap("Title must not be empty!") };
    switch (scriptMap.get(id)) {
      case (null) { Runtime.trap("Video script not found") };
      case (?script) {
        if (script.owner != caller) { Runtime.trap("You do not own this video script!") };
        let updatedScript : VideoScript = {
          script with
          title;
          niche;
          tone;
          topic;
          hook;
          intro;
          body;
          callToAction;
        };
        scriptMap.add(id, updatedScript);
        updatedScript;
      };
    };
  };

  public shared ({ caller }) func deleteVideoScript(id : ID) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete video scripts");
    };
    switch (scriptMap.get(id)) {
      case (null) { Runtime.trap("Video script not found") };
      case (?script) {
        if (script.owner != caller) { Runtime.trap("You do not own this video script!") };
        scriptMap.remove(id);
        let currentProfile = switch (userProfileMap.get(caller)) {
          case (null) {
            let defaultProfile : UserProfile = {
              name = "";
              channels = Set.empty<ID>();
              contentIdeas = Set.empty<ID>();
              scripts = Set.empty<ID>();
              revenueEntries = Set.empty<ID>();
              analyticsSnapshots = Set.empty<ID>();
              createdAt = getCurrentTime();
            };
            userProfileMap.add(caller, defaultProfile);
            defaultProfile;
          };
          case (?profile) { profile };
        };
        let updatedScripts = currentProfile.scripts.clone();
        updatedScripts.remove(id);
        updateUserProfilePrincipal(
          caller,
          { currentProfile with scripts = updatedScripts },
        );
      };
    };
  };

  ////////////////////////////////////////////
  //     Revenue Tracker CRUD Operations    //
  ////////////////////////////////////////////
  public shared ({ caller }) func createRevenueEntry(channelId : ID, source : RevenueSource, amount : Float, currency : Text, date : Int, desc : Text) : async RevenueEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create revenue entries");
    };
    let id = nextRevenueId;
    nextRevenueId += 1;
    let newEntry : RevenueEntry = {
      id;
      owner = caller;
      channelId;
      source;
      amount;
      currency;
      date;
      description = desc;
    };
    revenueMap.add(id, newEntry);
    let currentProfile = switch (userProfileMap.get(caller)) {
      case (null) {
        let defaultProfile : UserProfile = {
          name = "";
          channels = Set.empty<ID>();
          contentIdeas = Set.empty<ID>();
          scripts = Set.empty<ID>();
          revenueEntries = Set.empty<ID>();
          analyticsSnapshots = Set.empty<ID>();
          createdAt = getCurrentTime();
        };
        userProfileMap.add(caller, defaultProfile);
        defaultProfile;
      };
      case (?profile) { profile };
    };
    let updatedRevenues = currentProfile.revenueEntries.clone();
    updatedRevenues.add(id);
    updateUserProfilePrincipal(
      caller,
      { currentProfile with revenueEntries = updatedRevenues },
    );
    newEntry;
  };

  public query ({ caller }) func getRevenueEntry(id : ID) : async RevenueEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view revenue entries");
    };
    switch (revenueMap.get(id)) {
      case (null) { Runtime.trap("Revenue entry not found") };
      case (?entry) {
        if (entry.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own revenue entries");
        };
        entry;
      };
    };
  };

  public query ({ caller }) func getAllRevenueEntries() : async [RevenueEntry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all revenue entries");
    };
    revenueMap.values().toArray();
  };

  public query ({ caller }) func getMyRevenueEntries() : async [RevenueEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view revenue entries");
    };
    let myEntries = List.empty<RevenueEntry>();
    for ((id, entry) in revenueMap.entries()) {
      if (entry.owner == caller) {
        myEntries.add(entry);
      };
    };
    myEntries.toArray();
  };

  public shared ({ caller }) func updateRevenueEntry(id : ID, channelId : ID, source : RevenueSource, amount : Float, currency : Text, date : Int, desc : Text) : async RevenueEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update revenue entries");
    };
    switch (revenueMap.get(id)) {
      case (null) { Runtime.trap("Revenue entry not found") };
      case (?entry) {
        if (entry.owner != caller) { Runtime.trap("You do not own this revenue entry!") };
        let updatedEntry : RevenueEntry = {
          entry with
          channelId;
          source;
          amount;
          currency;
          date;
          description = desc;
        };
        revenueMap.add(id, updatedEntry);
        updatedEntry;
      };
    };
  };

  public shared ({ caller }) func deleteRevenueEntry(id : ID) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete revenue entries");
    };
    switch (revenueMap.get(id)) {
      case (null) { Runtime.trap("Revenue entry not found") };
      case (?entry) {
        if (entry.owner != caller) { Runtime.trap("You do not own this revenue entry!") };
        revenueMap.remove(id);
        let currentProfile = switch (userProfileMap.get(caller)) {
          case (null) {
            let defaultProfile : UserProfile = {
              name = "";
              channels = Set.empty<ID>();
              contentIdeas = Set.empty<ID>();
              scripts = Set.empty<ID>();
              revenueEntries = Set.empty<ID>();
              analyticsSnapshots = Set.empty<ID>();
              createdAt = getCurrentTime();
            };
            userProfileMap.add(caller, defaultProfile);
            defaultProfile;
          };
          case (?profile) { profile };
        };
        let updatedRevenues = currentProfile.revenueEntries.clone();
        updatedRevenues.remove(id);
        updateUserProfilePrincipal(
          caller,
          { currentProfile with revenueEntries = updatedRevenues },
        );
      };
    };
  };

  ///////////////////////////////////////////
  //   Analytics Tracker CRUD Operations   //
  ///////////////////////////////////////////
  public shared ({ caller }) func createAnalyticsSnapshot(channelId : ID, subs : Nat, totalViews : Nat, monthlyViews : Nat, monthlyRevenue : Float, date : Int) : async AnalyticsSnapshot {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create analytics snapshot");
    };
    let id = nextAnalyticsId;
    nextAnalyticsId += 1;
    let newSnapshot : AnalyticsSnapshot = {
      id;
      owner = caller;
      channelId;
      subscribers = subs;
      totalViews;
      monthlyViews;
      monthlyRevenue;
      date;
    };
    analyticsMap.add(id, newSnapshot);
    let currentProfile = switch (userProfileMap.get(caller)) {
      case (null) {
        let defaultProfile : UserProfile = {
          name = "";
          channels = Set.empty<ID>();
          contentIdeas = Set.empty<ID>();
          scripts = Set.empty<ID>();
          revenueEntries = Set.empty<ID>();
          analyticsSnapshots = Set.empty<ID>();
          createdAt = getCurrentTime();
        };
        userProfileMap.add(caller, defaultProfile);
        defaultProfile;
      };
      case (?profile) { profile };
    };
    let updatedAnalytics = currentProfile.analyticsSnapshots.clone();
    updatedAnalytics.add(id);
    updateUserProfilePrincipal(
      caller,
      { currentProfile with analyticsSnapshots = updatedAnalytics },
    );
    newSnapshot;
  };

  public query ({ caller }) func getAnalyticsSnapshot(id : ID) : async AnalyticsSnapshot {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics snapshots");
    };
    switch (analyticsMap.get(id)) {
      case (null) { Runtime.trap("Analytics snapshot not found") };
      case (?snapshot) {
        if (snapshot.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own analytics snapshots");
        };
        snapshot;
      };
    };
  };

  public query ({ caller }) func getAllAnalyticsSnapshots() : async [AnalyticsSnapshot] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all analytics snapshots");
    };
    analyticsMap.values().toArray();
  };

  public query ({ caller }) func getMyAnalyticsSnapshots() : async [AnalyticsSnapshot] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view analytics snapshots");
    };
    let mySnapshots = List.empty<AnalyticsSnapshot>();
    for ((id, snapshot) in analyticsMap.entries()) {
      if (snapshot.owner == caller) {
        mySnapshots.add(snapshot);
      };
    };
    mySnapshots.toArray();
  };

  public shared ({ caller }) func updateAnalyticsSnapshot(id : ID, channelId : ID, subs : Nat, totalViews : Nat, monthlyViews : Nat, monthlyRevenue : Float, date : Int) : async AnalyticsSnapshot {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update analytics snapshot");
    };
    switch (analyticsMap.get(id)) {
      case (null) { Runtime.trap("Analytics snapshot not found") };
      case (?snapshot) {
        if (snapshot.owner != caller) { Runtime.trap("You do not own this analytics snapshot!") };
        let updatedSnapshot : AnalyticsSnapshot = {
          snapshot with
          channelId;
          subscribers = subs;
          totalViews;
          monthlyViews;
          monthlyRevenue;
          date;
        };
        analyticsMap.add(id, updatedSnapshot);
        updatedSnapshot;
      };
    };
  };

  public shared ({ caller }) func deleteAnalyticsSnapshot(id : ID) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete analytics snapshot");
    };
    switch (analyticsMap.get(id)) {
      case (null) { Runtime.trap("Analytics snapshot not found") };
      case (?snapshot) {
        if (snapshot.owner != caller) { Runtime.trap("You do not own this analytics snapshot!") };
        analyticsMap.remove(id);
        let currentProfile = switch (userProfileMap.get(caller)) {
          case (null) {
            let defaultProfile : UserProfile = {
              name = "";
              channels = Set.empty<ID>();
              contentIdeas = Set.empty<ID>();
              scripts = Set.empty<ID>();
              revenueEntries = Set.empty<ID>();
              analyticsSnapshots = Set.empty<ID>();
              createdAt = getCurrentTime();
            };
            userProfileMap.add(caller, defaultProfile);
            defaultProfile;
          };
          case (?profile) { profile };
        };
        let updatedAnalytics = currentProfile.analyticsSnapshots.clone();
        updatedAnalytics.remove(id);
        updateUserProfilePrincipal(
          caller,
          { currentProfile with analyticsSnapshots = updatedAnalytics },
        );
      };
    };
  };

  //////////////////////////
  //   Dashboard Stats   //
  //////////////////////////
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };
    let myAnalytics = getMyAnalyticsSnapshotsInternal(caller);
    let myRevenue = getMyRevenueEntriesInternal(caller);
    let myIdeas = getMyContentIdeasInternal(caller);

    var totalSubscribers = 0;
    var totalViews = 0;
    var totalRevenue = 0.0;

    for (snapshot in myAnalytics.values()) {
      totalSubscribers += snapshot.subscribers;
      totalViews += snapshot.totalViews;
    };

    for (entry in myRevenue.values()) {
      totalRevenue += entry.amount;
    };

    {
      totalSubscribers;
      totalViews;
      totalRevenue;
      totalVideos = myAnalytics.size();
      totalIdeas = myIdeas.size();
    };
  };

  // Internal helper to get all content ideas by a user
  func getMyContentIdeasInternal(user : Principal) : List.List<ContentIdea> {
    let myIdeas = List.empty<ContentIdea>();
    for ((id, idea) in ideaMap.entries()) {
      if (idea.owner == user) {
        myIdeas.add(idea);
      };
    };
    myIdeas;
  };

  // Internal helper to get all revenue entries by a user
  func getMyRevenueEntriesInternal(user : Principal) : List.List<RevenueEntry> {
    let myRevenue = List.empty<RevenueEntry>();
    for ((id, entry) in revenueMap.entries()) {
      if (entry.owner == user) {
        myRevenue.add(entry);
      };
    };
    myRevenue;
  };

  // Internal helper to get all analytics snapshots by a user
  func getMyAnalyticsSnapshotsInternal(user : Principal) : List.List<AnalyticsSnapshot> {
    let myAnalytics = List.empty<AnalyticsSnapshot>();
    for ((id, snapshot) in analyticsMap.entries()) {
      if (snapshot.owner == user) {
        myAnalytics.add(snapshot);
      };
    };
    myAnalytics;
  };
};
