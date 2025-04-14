// Knowledge base storage module for Electron main process

// Define types
export interface Document {
  id: string;
  name: string;
  path: string;
  content: string;
  dateAdded: Date;
}

export interface KnowledgeCollection {
  id: string;
  name: string;
  description?: string;
  documents: Document[];
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  content?: string;
}

// In-memory storage
const knowledgeBases: KnowledgeBase[] = [];
const knowledgeCollections: KnowledgeCollection[] = [];

// Collection methods
export function getAllCollections(): KnowledgeCollection[] {
  console.log(`Getting all collections. Count: ${knowledgeCollections.length}`);
  return knowledgeCollections;
}

export function getCollection(id: string | number): KnowledgeCollection | undefined {
  console.log(`Looking for collection: ${id}`);
  return knowledgeCollections.find(c => c.id === id.toString());
}

export function createCollection(name: string, description?: string): KnowledgeCollection {
  console.log(`Creating collection: ${name}`);
  const id = `collection-${Date.now()}`;
  const newCollection: KnowledgeCollection = { 
    id, 
    name, 
    description, 
    documents: [] 
  };
  knowledgeCollections.push(newCollection);
  console.log(`Created collection with ID: ${id}`);
  return newCollection;
}

export function getDocumentsForCollection(collectionId: string | number): Document[] {
  console.log(`Getting documents for collection: ${collectionId}`);
  const collection = getCollection(collectionId);
  if (!collection) {
    console.log(`Collection ${collectionId} not found`);
    return [];
  }
  console.log(`Found ${collection.documents.length} documents`);
  return collection.documents;
}

export function addDocumentToCollection(collectionId: string | number, document: Document): boolean {
  console.log(`Adding document to collection: ${collectionId}`);
  const collection = getCollection(collectionId);
  
  if (collection) {
    collection.documents.push(document);
    console.log(`Added document ${document.id} to collection ${collectionId}`);
    return true;
  } 
  
  // If collection doesn't exist, create it
  const newCollection: KnowledgeCollection = {
    id: collectionId.toString(),
    name: `Collection ${collectionId}`,
    documents: [document]
  };
  
  knowledgeCollections.push(newCollection);
  console.log(`Created new collection ${collectionId} and added document ${document.id}`);
  return true;
}

export function removeDocumentFromCollection(documentId: string): boolean {
  console.log(`Removing document: ${documentId}`);
  let removed = false;
  
  // Look through all collections for the document
  for (const collection of knowledgeCollections) {
    const index = collection.documents.findIndex(doc => doc.id === documentId);
    if (index >= 0) {
      collection.documents.splice(index, 1);
      removed = true;
      console.log(`Removed document ${documentId} from collection ${collection.id}`);
      break;
    }
  }
  
  return removed;
}

// Knowledge base methods
export function getAllKnowledgeBases(): KnowledgeBase[] {
  console.log(`Getting all knowledge bases. Count: ${knowledgeBases.length}`);
  return knowledgeBases;
}

export function createKnowledgeBase(name: string, content: string, description?: string): KnowledgeBase {
  console.log(`Creating knowledge base: ${name}`);
  const id = `kb-${Date.now()}`;
  const newKB: KnowledgeBase = { 
    id, 
    name, 
    description, 
    content 
  };
  knowledgeBases.push(newKB);
  console.log(`Created knowledge base with ID: ${id}`);
  return newKB;
}

export function removeKnowledgeBase(id: string): boolean {
  console.log(`Removing knowledge base: ${id}`);
  const index = knowledgeBases.findIndex(kb => kb.id === id);
  if (index !== -1) {
    knowledgeBases.splice(index, 1);
    console.log(`Removed knowledge base ${id}`);
    return true;
  }
  console.log(`Knowledge base ${id} not found`);
  return false;
}

// Add some sample data for testing
export function addSampleData() {
  if (knowledgeCollections.length === 0) {
    const sampleCollection = createCollection('Sample Collection', 'Sample description');
    
    const doc1: Document = {
      id: 'doc-1',
      name: 'Sample Document 1',
      path: '/path/to/sample1.txt',
      content: 'This is the content of sample document 1.',
      dateAdded: new Date()
    };
    
    const doc2: Document = {
      id: 'doc-2',
      name: 'Sample Document 2',
      path: '/path/to/sample2.txt',
      content: 'This is the content of sample document 2.',
      dateAdded: new Date()
    };
    
    addDocumentToCollection(sampleCollection.id, doc1);
    addDocumentToCollection(sampleCollection.id, doc2);
    
    console.log('Added sample data');
  }
} 