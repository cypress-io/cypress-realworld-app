//a group model we created
export interface Group {
    id: string;
    uuid: string;
    groupName: string;
    creatorId: string;
    avatar: string;
    createdAt: Date;
    modifiedAt: Date;
}

export interface GroupResponseItem extends Group {
    members: string[];
    creatorName: string;
}

// *to-add - total amount,


  