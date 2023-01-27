import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  Product,
  CreateProductDTO,
  UpdateProductDOT,
} from '../../../models/product.model';
import { StoreService } from '../../../services/store.service';
import { ProductsService } from '../../../services/products.service';
import { switchMap, zip } from 'rxjs';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  myAddToShoppingCart: Product[] = [];
  total = 0;
  showProductDetail: boolean = false;
  productChosen!: Product;
  @Input() products: Product[] = [];
  @Input() set productId(id: string | null) {
    if (id) {
      this.onShowDetail(id);
    }
  }
  @Output() onLoadMore: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private storeService: StoreService,
    private productsService: ProductsService
  ) {
    this.myAddToShoppingCart = this.storeService.getShoppingCart();
  }

  ngOnInit(): void {}

  onAddToShoppingCart(product: Product) {
    this.storeService.addProduct(product);
    this.total = this.storeService.getTotal();
  }

  toggleProductDetail() {
    this.showProductDetail = !this.showProductDetail;
  }

  onShowDetail(id: string) {
    if (!this.showProductDetail) {
      this.showProductDetail = true;
    }
    this.productsService.getProduct(id).subscribe(
      (data) => {
        this.productChosen = data;
      },
      (errorMessage) => {
        console.log(errorMessage);
        window.alert(errorMessage);
      }
    );
  }

  //Evitando Callback Hell
  readAndUpdate(id: string) {
    this.productsService
      .getProduct(id)
      .pipe(
        switchMap((product) => {
          return this.productsService.update(product.id, { title: 'change' });
        })
      )
      .subscribe((data) => {
        console.log(data);
      });

    //Misma Funcion del PromiseAll
    // zip(
    //   this.productsService.getProduct(id),
    //   this.productsService.update(id, {title: 'nuevo'}),
    // )
    // .subscribe(response => {
    //   const product = response[0];
    //   const update = response[1];
    // })

    this.productsService
      .fetchReadAndUpdate(id, { title: 'nuevo' })
      .subscribe((response) => {
        const product = response[0];
        const update = response[1];
      });
  }

  createNewProduct() {
    const product: CreateProductDTO = {
      title: 'Nuevo Producto',
      price: 1000,
      images: ['https://placeimg.com/640/480/any'],
      description: 'bla bla bla',
      categoryId: 2,
    };
    this.productsService.create(product).subscribe((data) => {
      this.products.unshift(data);
    });
  }

  updateProduct() {
    const changes: UpdateProductDOT = {
      title: 'nuevo title',
    };
    const id = this.productChosen.id;
    this.productsService.update(id, changes).subscribe((data) => {
      const productIndex = this.products.findIndex((item) => item.id === id);
      this.products[productIndex] = data;
      this.productChosen = data;
    });
  }

  deleteProduct() {
    const id = this.productChosen.id;
    this.productsService.delete(id).subscribe(() => {
      const productIndex = this.products.findIndex((item) => item.id === id);
      this.products.splice(productIndex, 1);
      this.showProductDetail = false;
    });
  }

  loadMore() {
    this.onLoadMore.emit();
  }
}
