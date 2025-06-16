from sqlalchemy.orm import Session
from module.database import SessionLocal
from module import models

def update_product_types():
    db = SessionLocal()
    try:
        # Update products based on their status
        products = db.query(models.Product).all()
        for product in products:
            if product.status == 'newest':
                product.product_type = 'newest'
            elif product.status == 'trending':
                product.product_type = 'trending'
            elif product.status == 'best_seller':
                product.product_type = 'best_seller'
            else:
                # Set a default type if status is not one of the above
                product.product_type = 'newest'
        
        db.commit()
        print("Successfully updated product types")
        
        # Print the results
        products = db.query(models.Product).all()
        for product in products:
            print(f"Product: {product.title}, Type: {product.product_type}")
            
    except Exception as e:
        print(f"Error updating product types: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_product_types() 