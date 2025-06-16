class JSONDatabase:
    def __init__(self, db_name):
        self.db_name = db_name
        print(f"Mock JSONDatabase initialized for {db_name}")

    def load_data(self):
        print(f"Mock loading data from {self.db_name}")
        return {"message": f"Mock data from {self.db_name}"}

    def find(self, query):
        print(f"Mock finding data in {self.db_name} for query {query}")
        return [{"message": f"Mock found data in {self.db_name} for query {query}"}] 