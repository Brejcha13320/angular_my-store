import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpStatusCode,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, retry, throwError, zip } from 'rxjs';
import { environment } from './../../environments/environment';
import { checkTime } from '../interceptors/time.interceptor';
import {
  Product,
  CreateProductDTO,
  UpdateProductDOT,
} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  // private apiUrl = 'https://young-sands-07814.herokuapp.com/api/products';
  private apiUrl = `${environment.API_URL}/api`;

  constructor(private http: HttpClient) {}

  getByCategory(categoryId: string, limit?: number, offset?: number) {
    let params = new HttpParams();
    if (limit != undefined && offset != undefined) {
      params = params.set('limit', limit);
      params = params.set('offset', offset);
    }
    return this.http.get<Product[]>(
      `${this.apiUrl}/categories/${categoryId}/products`,
      {
        params,
      }
    );
  }

  getProducts(limit?: number, offset?: number) {
    let params = new HttpParams();
    if (limit != undefined && offset != undefined) {
      params = params.set('limit', limit);
      params = params.set('offset', offset);
    }
    return this.http
      .get<Product[]>(`${this.apiUrl}/products`, {
        params,
        context: checkTime(),
      })
      .pipe(
        // retry(3),
        map((products: Product[]) =>
          products.map((item) => {
            return {
              ...item,
              taxes: 0.19 * item.price,
            };
          })
        )
      );
  }

  fetchReadAndUpdate(id: string, to: UpdateProductDOT) {
    return zip(this.getProduct(id), this.update(id, { title: 'nuevo' }));
  }

  getProduct(id: string) {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        //Codigo del Status
        if (error.status === 500) {
          return throwError('Algo esta fallando en el serve');
        }
        if (error.status === 404) {
          return throwError('El producto no existe');
        }

        //Usando HttpStatusCode
        if (error.status === HttpStatusCode.Unauthorized) {
          return throwError('No estas autorizado');
        }

        return throwError('Ups algo salio mal');
      })
    );
  }

  getProductsByPage(limit: number, offset: number) {
    return this.http.get<Product[]>(`${this.apiUrl}/products`, {
      params: { limit, offset },
    });
  }

  create(dto: CreateProductDTO) {
    return this.http.post<Product>(`${this.apiUrl}/product`, dto);
  }

  update(id: string, dto: UpdateProductDOT) {
    return this.http.put<Product>(`${this.apiUrl}/product/${id}`, dto);
  }

  delete(id: string) {
    return this.http.delete<boolean>(`${this.apiUrl}/product/${id}`);
  }
}
