// many-to-many table between User and Group

//enum with all legal permissions
export enum PremissionsLevel {
    admin= "admin",
    member="member"
}
  

export interface GroupMember {
    id: string;
    uuid: string;
    userId: string;
    groupId: string;
    premmisions: PremissionsLevel;
    createdAt: Date;
    modifiedAt: Date;
}