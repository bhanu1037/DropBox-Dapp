// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

contract DStorage {
  // Name
  string public name = 'DStorage';
  // Number of files
  uint public fileCount = 0;
  // Mapping fileId=>Struct 
  mapping( uint => File) public files;

  // Struct
  struct File{
   uint fileId;
   string fileHash;
   uint fileSize;
   string fileType;
   string fileName;
   string fileDescription;
   uint uploadTime;
   int upvotes;
   address payable uploader; 
  }


  // Event
  event FileUploaded(
    uint fileId,
    string fileHash,
    uint fileSize,
    string fileType,
    string fileName,
    string fileDescription,
    uint uploadTime,
    int upvotes,
    address payable uploader
  );

  constructor() public {
  }
  
  function fileUpvoted(uint _fileId) public {
    files[_fileId].upvotes++;
  }
  function fileDownvoted(uint _fileId) public {
    files[_fileId].upvotes--;
  }

  // Upload File function
  function uploadFile(string memory _fileHash,uint _fileSize,string memory _fileType,string memory _fileName,string memory _fileDescription) public {
    // Make sure the file hash exists
      require(bytes(_fileHash).length > 0);
    // Make sure file type exists
      require(bytes(_fileType).length > 0);
    // Make sure file description exists
      require(bytes(_fileDescription).length > 0);
    // Make sure file fileName exists
      require(bytes(_fileName).length > 0);
    // Make sure uploader address exists
      require(msg.sender!=address(0));
    // Make sure file size is more than 0
      require(_fileSize>0);


    // Increment file id
    fileCount++;
    // Add File to the contract
    files[fileCount] = File(fileCount, _fileHash, _fileSize, _fileType, _fileName, _fileDescription,block.timestamp, 0,msg.sender);

    // Trigger an event
    emit FileUploaded(fileCount,_fileHash,_fileSize,_fileType,_fileName,_fileDescription,block.timestamp,0,msg.sender);
  }

}