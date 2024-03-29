import { Component,OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ApiServicesService } from './Services/api-services.service';
import { Subject, map, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Message} from '../app/modals/messages'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {

  @ViewChild('chatHistoryDiv') chatHistoryDiv!: ElementRef;

  title = 'connect-hub';

  messageForm!: FormGroup;

  submitted:boolean=false;

  isFetching:boolean=false;

  allMessages: Message[]=[]

  private ngUnSubscribe: Subject<void> | undefined;

  constructor(
    private apiService: ApiServicesService,
    private formBuilder: FormBuilder,
    private http:HttpClient,
    private cdr:ChangeDetectorRef
    ){}

  ngOnInit(): void {
    this.ngUnSubscribe = new Subject<void>();
    this.initializeForm();
    this.receiveMessage();
  }

  initializeForm(): void {
    this.messageForm = this.formBuilder.group({
      message: ['', [Validators.required]],
    });
  }

  
  SendMesage(){
    this.submitted = true;
    if (this.messageForm.invalid) {
      return;
    }
    const formData = {
      message: this.messageForm.get('message')?.value,
    };
    const headers=new HttpHeaders({'myHeader':'Praveen'});
    this.http.post<{message:string}>('https://connecthub-6f9e0-default-rtdb.firebaseio.com/messages.json', formData,  { headers }).subscribe((res) => {
      console.log(res)
    this.messageForm.reset();
    });
    setTimeout(() => {
      this.receiveMessage();
    }, 1000);
  }

  receiveMessage(){
    this.isFetching = true;
    this.apiService.fetchMessages().subscribe((res)=>{
      this.allMessages = res;
      this.isFetching = false;
    })
    this.cdr.markForCheck;
    setTimeout(() => {
      this.scrollToBottom();
    }, 1000);

  }

  scrollToBottom(): void {
    try {
      if (this.chatHistoryDiv) {
        const chatHistoryDivEl: HTMLElement = this.chatHistoryDiv.nativeElement as HTMLElement;
        chatHistoryDivEl.scrollTop = chatHistoryDivEl.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  ngOnDestroy(): void {
    this.ngUnSubscribe?.next();
    this.ngUnSubscribe?.complete();
  }

}
