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

  showEmojiMenu:boolean=false;

  emojiSet = '';

  spinnerToggle:boolean=false;

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
    this.showEmojiMenu=false;
    if (this.messageForm.invalid) {
      return;
    }
    this.spinnerToggle=true;
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
      // this.spinnerToggle=false;
    }, 1000);
  }

  receiveMessage(){
    this.spinnerToggle=true;
    this.isFetching = true;
    this.showEmojiMenu=false;
    this.messageForm.reset();
    this.apiService.fetchMessages().subscribe((res)=>{
      this.allMessages = res;
      this.isFetching = false;
    })
    this.cdr.markForCheck;
    setTimeout(() => {
      this.scrollToBottom();
      this.spinnerToggle=false;
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

  addEmoji(event: any) {
    const emoji = event.emoji.native; // Get the selected emoji
    const messageControl = this.messageForm.get('message');
    if (messageControl) {
      let currentMessage = messageControl.value || ''; // Check if there's any existing text
      const updatedMessage = currentMessage + emoji;
      messageControl.setValue(updatedMessage);
    } else {
      this.messageForm.get('message')?.setValue(emoji); // Use optional chaining to access setValue if messageControl is null
    }
    console.log('Selected emoji:', emoji);
  }

  selectEmoji(){
    this.showEmojiMenu=!this.showEmojiMenu;
  }

  sendMessageOnEnter() {
    if (!this.showEmojiMenu) {
      this.SendMesage();
    }
  }

  ngOnDestroy(): void {
    this.ngUnSubscribe?.next();
    this.ngUnSubscribe?.complete();
  }

}
