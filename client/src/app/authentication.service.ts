import { Injectable } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterModule, Routes, Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';

export interface UserDetails {
  _id: string;
  email: string;
  name: string;
  exp: number;
  iat: number;
}

interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  email: string;
  password: string;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private token: string;

  constructor(private http: HttpClient, private router: Router) { }
  
   private saveToken(token: string): void {
    localStorage.setItem('mean-token', token);
    this.token = token;
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('mean-token');
    }
    return this.token;
  }

  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('mean-token');
    this.router.navigateByUrl('/');
  }
  
  public getUserDetails(): UserDetails {
    const token = this.getToken();
    let payload;
    if (token) {
     payload = token.split('.')[1];
     payload = window.atob(payload);
     return JSON.parse(payload);
    }
    else {
     return null;
    }
  }
  
  public isLoggedIn(): boolean {
    const user = this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } 
    else {
      return false;
    }
  }
  
  private request(method: 'post'|'get', type: 'login'|'register'|'profile', user?: TokenPayload): Observable<any> {
    let base;

    if (method === 'post') {
      base = this.http.post(`https://track-my-expenses-chilivote.c9users.io:8081/api/${type}`, user)
      .pipe(
      catchError(this.handleError('register', [])));
    } else {
      base = this.http.get(`https://track-my-expenses-chilivote.c9users.io:8081/api/${type}`, { headers: { Authorization: `Bearer ${this.getToken()}` }});
    }

    const request = base.pipe(
    map((data: TokenResponse) => {
      if (data.token) {
        this.saveToken(data.token);
      }
      return data;
      })
    );
    
    return request;
  }
  
  public register(user: TokenPayload): Observable<any> {
    return this.request('post', 'register', user);
  }

  public login(user: TokenPayload): Observable<any> {
    return this.request('post', 'login', user);
  }

  public profile(): Observable<any> {
    return this.request('get', 'profile');
  }
  
  
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
 
    // TODO: send the error to remote logging infrastructure
    //console.error(error); // log to console instead
    //console.log(error.error.message);
 
    // TODO: better job of transforming error for user consumption
    //console.log(`${operation} failed: ${error.message}`);
 
    // Let the app keep running by returning an empty result.
    //return of(result as T);
    return throwError(
    `${error.error.message}`);
    };
  }
}
